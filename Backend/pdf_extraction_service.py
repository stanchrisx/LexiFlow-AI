"""
PDF Extraction Service using PyMuPDF (fitz) and Tesseract OCR
Extracts text, images, and graphics while preserving document structure
"""
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import base64
from typing import List, Dict, Any, Tuple
import logging
from models import ContentBlock, PDFPage


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PDFExtractionService:
    """Service for extracting content from PDF files"""
    
    def __init__(self):
        self.dpi = 300  # High DPI for better OCR quality
        
    def extract_pdf_content(self, pdf_bytes: bytes, filename: str) -> Tuple[List[PDFPage], int]:
        """
        Extract all content from PDF including text and images
        
        Args:
            pdf_bytes: PDF file content as bytes
            filename: Original filename
            
        Returns:
            Tuple of (list of PDFPage objects, total file size)
        """
        try:
            # Open PDF from bytes
            pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
            total_pages = len(pdf_document)
            
            logger.info(f"Processing PDF: {filename} with {total_pages} pages")
            
            pages = []
            for page_num in range(total_pages):
                page = pdf_document[page_num]
                pdf_page = self._extract_page_content(page, page_num + 1)
                pages.append(pdf_page)
                
            pdf_document.close()
            
            return pages, len(pdf_bytes)
            
        except Exception as e:
            logger.error(f"Error extracting PDF content: {e}")
            raise Exception(f"Failed to extract PDF content: {str(e)}")
    
    def _extract_page_content(self, page: fitz.Page, page_number: int) -> PDFPage:
        """
        Extract content from a single PDF page
        
        Args:
            page: PyMuPDF page object
            page_number: Page number (1-indexed)
            
        Returns:
            PDFPage object with extracted content
        """
        content_blocks = []
        block_order = 0
        
        # First, try to extract text with positions using PyMuPDF
        text_blocks = page.get_text("dict")["blocks"]
        has_text = False
        
        for block in text_blocks:
            if block.get("type") == 0:  # Text block
                has_text = True
                for line in block.get("lines", []):
                    line_text = ""
                    for span in line.get("spans", []):
                        line_text += span.get("text", "")
                    
                    if line_text.strip():
                        bbox = line.get("bbox", [0, 0, 0, 0])
                        content_blocks.append(
                            ContentBlock(
                                type="paragraph",
                                content=line_text.strip(),
                                page_number=page_number,
                                position={
                                    "x": bbox[0],
                                    "y": bbox[1],
                                    "width": bbox[2] - bbox[0],
                                    "height": bbox[3] - bbox[1]
                                },
                                order=block_order,
                                metadata={"font_size": line.get("spans", [{}])[0].get("size", 12)},
                                is_editable=True
                            )
                        )
                        block_order += 1
            
            elif block.get("type") == 1:  # Image block
                bbox = block.get("bbox", [0, 0, 0, 0])
                
                # Extract image
                try:
                    image_data = self._extract_image_from_block(page, block)
                    if image_data:
                        content_blocks.append(
                            ContentBlock(
                                type="image",
                                content=image_data,
                                page_number=page_number,
                                position={
                                    "x": bbox[0],
                                    "y": bbox[1],
                                    "width": bbox[2] - bbox[0],
                                    "height": bbox[3] - bbox[1]
                                },
                                order=block_order,
                                metadata={"source": "pdf_embedded"},
                                is_editable=False
                            )
                        )
                        block_order += 1
                except Exception as e:
                    logger.warning(f"Failed to extract image from block: {e}")
        
        # If no text found, perform OCR on the entire page
        ocr_confidence = None
        if not has_text or len(content_blocks) == 0:
            logger.info(f"No text found on page {page_number}, performing OCR...")
            ocr_blocks, ocr_confidence = self._perform_ocr_on_page(page, page_number, block_order)
            content_blocks.extend(ocr_blocks)
            has_text = len(ocr_blocks) > 0
        
        # Render page as image for "original" view
        page_image = self._render_page_as_image(page)
        
        return PDFPage(
            page_number=page_number,
            content_blocks=content_blocks,
            original_image=page_image,
            has_ocr=not has_text or ocr_confidence is not None,
            ocr_confidence=ocr_confidence
        )
    
    def _extract_image_from_block(self, page: fitz.Page, block: Dict) -> str:
        """
        Extract image from a block and convert to base64
        
        Args:
            page: PyMuPDF page object
            block: Image block dictionary
            
        Returns:
            Base64 encoded image string
        """
        try:
            # Get image info
            image_list = page.get_images()
            if not image_list:
                return None
            
            # Get the first image (simplification - in production, match by bbox)
            xref = image_list[0][0]
            base_image = page.parent.extract_image(xref)
            image_bytes = base_image["image"]
            
            # Convert to base64
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            image_ext = base_image["ext"]
            
            return f"data:image/{image_ext};base64,{image_base64}"
            
        except Exception as e:
            logger.warning(f"Failed to extract image: {e}")
            return None
    
    def _perform_ocr_on_page(self, page: fitz.Page, page_number: int, 
                            start_order: int) -> Tuple[List[ContentBlock], float]:
        """
        Perform OCR on a page using Tesseract
        
        Args:
            page: PyMuPDF page object
            page_number: Page number
            start_order: Starting order number for blocks
            
        Returns:
            Tuple of (list of ContentBlock objects, average confidence)
        """
        try:
            # Render page to image at high DPI
            pix = page.get_pixmap(matrix=fitz.Matrix(self.dpi/72, self.dpi/72))
            img_bytes = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_bytes))
            
            # Perform OCR with detailed data
            ocr_data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
            
            content_blocks = []
            block_order = start_order
            confidences = []
            
            # Group text by lines
            current_line = None
            current_line_text = []
            current_line_bbox = None
            
            for i in range(len(ocr_data['text'])):
                text = ocr_data['text'][i].strip()
                conf = int(ocr_data['conf'][i])
                
                if text and conf > 30:  # Filter low confidence text
                    line_num = ocr_data['line_num'][i]
                    
                    if current_line != line_num:
                        # Save previous line
                        if current_line_text and current_line_bbox:
                            line_content = ' '.join(current_line_text)
                            content_blocks.append(
                                ContentBlock(
                                    type="paragraph",
                                    content=line_content,
                                    page_number=page_number,
                                    position=current_line_bbox,
                                    order=block_order,
                                    metadata={"ocr": True, "confidence": sum(confidences[-len(current_line_text):]) / len(current_line_text)},
                                    is_editable=True
                                )
                            )
                            block_order += 1
                        
                        # Start new line
                        current_line = line_num
                        current_line_text = [text]
                        current_line_bbox = {
                            "x": ocr_data['left'][i],
                            "y": ocr_data['top'][i],
                            "width": ocr_data['width'][i],
                            "height": ocr_data['height'][i]
                        }
                    else:
                        current_line_text.append(text)
                        # Expand bounding box
                        if current_line_bbox:
                            current_line_bbox['width'] = (ocr_data['left'][i] + ocr_data['width'][i]) - current_line_bbox['x']
                    
                    confidences.append(conf)
            
            # Save last line
            if current_line_text and current_line_bbox:
                line_content = ' '.join(current_line_text)
                content_blocks.append(
                    ContentBlock(
                        type="paragraph",
                        content=line_content,
                        page_number=page_number,
                        position=current_line_bbox,
                        order=block_order,
                        metadata={"ocr": True, "confidence": sum(confidences[-len(current_line_text):]) / len(current_line_text)},
                        is_editable=True
                    )
                )
            
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            logger.info(f"OCR completed for page {page_number} with confidence: {avg_confidence:.2f}")
            
            return content_blocks, avg_confidence
            
        except Exception as e:
            logger.error(f"OCR failed for page {page_number}: {e}")
            return [], 0.0
    
    def _render_page_as_image(self, page: fitz.Page) -> str:
        """
        Render page as base64 encoded image
        
        Args:
            page: PyMuPDF page object
            
        Returns:
            Base64 encoded PNG image
        """
        try:
            # Render at medium DPI for display
            pix = page.get_pixmap(matrix=fitz.Matrix(150/72, 150/72))
            img_bytes = pix.tobytes("png")
            img_base64 = base64.b64encode(img_bytes).decode('utf-8')
            return f"data:image/png;base64,{img_base64}"
        except Exception as e:
            logger.warning(f"Failed to render page image: {e}")
            return None


# Global instance
pdf_extraction_service = PDFExtractionService()

