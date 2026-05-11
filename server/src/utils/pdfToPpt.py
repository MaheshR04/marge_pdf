import sys
from pypdf import PdfReader
from pptx import Presentation
from pptx.util import Inches, Pt
import os

def convert_pdf_to_pptx(pdf_path, pptx_path):
    try:
        # Create presentation object
        prs = Presentation()
        
        # Open the PDF
        reader = PdfReader(pdf_path)
        
        for page in reader.pages:
            # Add a blank slide
            blank_slide_layout = prs.slide_layouts[6]
            slide = prs.slides.add_slide(blank_slide_layout)
            
            # Extract text
            text = page.extract_text()
            
            if text.strip():
                # Add a text box that fills the slide
                left = Inches(0.5)
                top = Inches(0.5)
                width = prs.slide_width - Inches(1.0)
                height = prs.slide_height - Inches(1.0)
                
                txBox = slide.shapes.add_textbox(left, top, width, height)
                tf = txBox.text_frame
                tf.word_wrap = True
                
                p = tf.add_paragraph()
                p.text = text
                p.font.size = Pt(12)
            
            # Optionally extract images if they exist
            # This is more complex but we can add placeholders or basic extraction
            try:
                for image_file_object in page.images:
                    # We could add images to the slide here
                    # For now, we prioritize text to avoid complex layout logic
                    pass
            except:
                pass
            
        # Save the presentation
        prs.save(pptx_path)
        print("SUCCESS")
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python pdfToPpt.py <input_pdf> <output_pptx>")
        sys.exit(1)

    input_pdf = sys.argv[1]
    output_pptx = sys.argv[2]
    
    convert_pdf_to_pptx(input_pdf, output_pptx)
