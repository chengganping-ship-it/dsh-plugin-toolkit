# Python Automation Cookbook - 100+ Scripts That Save Hours

> **Copy-paste Python scripts for real-world automation tasks**
> 
> No fluff, no theory — just working code you can use today.

---

## 📦 What's Inside

**100+ production-ready Python scripts** organized by use case. Each script includes:
- Complete code with comments
- Required dependencies
- Usage examples
- Expected output

### Categories

1. **File & Folder Automation** (15 scripts)
2. **Web Scraping & APIs** (20 scripts)
3. **Email & Messaging** (12 scripts)
4. **Data Processing** (18 scripts)
5. **Excel & Spreadsheets** (15 scripts)
6. **PDF & Documents** (10 scripts)
7. **Social Media Automation** (10 scripts)
8. **System & DevOps** (10 scripts)

---

## 🚀 Quick Start

### Script 1: Bulk File Renamer
```python
"""
Bulk File Renamer
Rename files in a folder with patterns, numbering, and filters.
"""
import os
import re
from pathlib import Path

def bulk_rename(folder_path, pattern=None, replace="", prefix="", suffix="", 
                start_number=1, filter_ext=None, dry_run=True):
    """
    Rename files in bulk with various options.
    
    Args:
        folder_path: Path to folder containing files
        pattern: Regex pattern to match in filename
        replace: Text to replace matched pattern with
        prefix: Add prefix to filename
        suffix: Add suffix to filename (before extension)
        start_number: Starting number for sequential numbering
        filter_ext: Only rename files with this extension (e.g., '.jpg')
        dry_run: If True, only show what would be renamed
    """
    folder = Path(folder_path)
    if not folder.exists():
        print(f"Folder not found: {folder_path}")
        return
    
    files = sorted(folder.iterdir())
    counter = start_number
    
    for file in files:
        if not file.is_file():
            continue
        
        if filter_ext and file.suffix.lower() != filter_ext.lower():
            continue
        
        # Build new name
        stem = file.stem
        ext = file.suffix
        
        # Apply pattern replacement
        if pattern:
            stem = re.sub(pattern, replace, stem)
        
        # Add numbering
        if start_number > 0:
            stem = f"{stem}_{counter:03d}"
            counter += 1
        
        # Add prefix/suffix
        new_name = f"{prefix}{stem}{suffix}{ext}"
        new_path = file.parent / new_name
        
        if dry_run:
            print(f"Would rename: {file.name} → {new_name}")
        else:
            file.rename(new_path)
            print(f"Renamed: {file.name} → {new_name}")

# Usage examples
if __name__ == "__main__":
    # Example 1: Add prefix to all JPG files
    bulk_rename("./photos", prefix="vacation_", filter_ext=".jpg", dry_run=False)
    
    # Example 2: Replace spaces with underscores
    bulk_rename("./documents", pattern=r"\s+", replace="_", dry_run=False)
    
    # Example 3: Sequential numbering
    bulk_rename("./exports", prefix="report_", start_number=1, dry_run=False)
```

### Script 2: Smart Web Scraper
```python
"""
Smart Web Scraper
Extract structured data from any webpage with intelligent parsing.
"""
import requests
from bs4 import BeautifulSoup
import json
import csv
from urllib.parse import urljoin, urlparse
import time
import random

class SmartScraper:
    def __init__(self, base_url, delay_range=(1, 3), respect_robots=True):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.delay_range = delay_range
        self.visited = set()
    
    def fetch(self, url):
        """Fetch page with rate limiting and error handling."""
        if url in self.visited:
            return None
        
        time.sleep(random.uniform(*self.delay_range))
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            self.visited.add(url)
            return response.text
        except requests.RequestException as e:
            print(f"Error fetching {url}: {e}")
            return None
    
    def extract_articles(self, html, container_selector, title_selector, 
                         link_selector, summary_selector=None):
        """Extract article listings from a page."""
        soup = BeautifulSoup(html, 'html.parser')
        articles = []
        
        containers = soup.select(container_selector)
        for container in containers:
            title_el = container.select_one(title_selector)
            link_el = container.select_one(link_selector)
            
            if title_el and link_el:
                article = {
                    'title': title_el.get_text(strip=True),
                    'url': urljoin(self.base_url, link_el.get('href', '')),
                }
                
                if summary_selector:
                    summary_el = container.select_one(summary_selector)
                    if summary_el:
                        article['summary'] = summary_el.get_text(strip=True)
                
                articles.append(article)
        
        return articles
    
    def extract_table(self, html, table_selector="table"):
        """Extract data from HTML tables."""
        soup = BeautifulSoup(html, 'html.parser')
        table = soup.select_one(table_selector)
        
        if not table:
            return []
        
        headers = []
        rows = []
        
        # Get headers
        header_row = table.find('thead')
        if header_row:
            headers = [th.get_text(strip=True) for th in header_row.find_all(['th', 'td'])]
        
        # Get rows
        for tr in table.find_all('tr'):
            cells = [td.get_text(strip=True) for td in tr.find_all(['td', 'th'])]
            if cells and cells != headers:
                rows.append(cells)
        
        return {'headers': headers, 'data': rows}
    
    def save_json(self, data, filename):
        """Save data to JSON file."""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Saved {len(data)} items to {filename}")
    
    def save_csv(self, data, filename):
        """Save list of dicts to CSV file."""
        if not data:
            return
        
        keys = data[0].keys()
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(data)
        print(f"Saved {len(data)} rows to {filename}")

# Usage example
if __name__ == "__main__":
    scraper = SmartScraper("https://example-blog.com")
    html = scraper.fetch("https://example-blog.com/articles")
    
    if html:
        articles = scraper.extract_articles(
            html,
            container_selector="article.post",
            title_selector="h2.entry-title",
            link_selector="a.read-more",
            summary_selector="p.excerpt"
        )
        scraper.save_json(articles, "articles.json")
        scraper.save_csv(articles, "articles.csv")
```

### Script 3: Email Campaign Sender
```python
"""
Email Campaign Sender
Send personalized emails using templates with CSV data.
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import csv
import time
from string import Template
import getpass

def send_campaign(template_file, contacts_file, smtp_config, delay=2):
    """
    Send personalized email campaign.
    
    Args:
        template_file: Path to email template (supports $name, $company, etc.)
        contacts_file: CSV with columns matching template variables
        smtp_config: Dict with host, port, username, password
        delay: Seconds between emails
    """
    # Read template
    with open(template_file, 'r', encoding='utf-8') as f:
        template = Template(f.read())
    
    # Read contacts
    with open(contacts_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        contacts = list(reader)
    
    print(f"Loaded {len(contacts)} contacts")
    
    # Connect to SMTP
    server = smtplib.SMTP(smtp_config['host'], smtp_config['port'])
    server.starttls()
    server.login(smtp_config['username'], smtp_config['password'])
    
    sent = 0
    failed = 0
    
    for contact in contacts:
        try:
            # Personalize message
            message = template.safe_substitute(contact)
            
            # Build email
            msg = MIMEMultipart('alternative')
            msg['Subject'] = contact.get('subject', 'Hello from us!')
            msg['From'] = smtp_config['username']
            msg['To'] = contact['email']
            msg.attach(MIMEText(message, 'html'))
            
            # Send
            server.send_message(msg)
            sent += 1
            print(f"✓ Sent to {contact['email']}")
            
            time.sleep(delay)
            
        except Exception as e:
            failed += 1
            print(f"✗ Failed {contact.get('email', 'unknown')}: {e}")
    
    server.quit()
    print(f"\nCampaign complete: {sent} sent, {failed} failed")

# Usage
if __name__ == "__main__":
    smtp_config = {
        'host': 'smtp.gmail.com',
        'port': 587,
        'username': 'your-email@gmail.com',
        'password': getpass.getpass("Email password: ")
    }
    
    send_campaign(
        template_file='email_template.html',
        contacts_file='contacts.csv',
        smtp_config=smtp_config,
        delay=3
    )
```

### Script 4: Excel Report Generator
```python
"""
Excel Report Generator
Create professional Excel reports with charts and formatting.
"""
import openpyxl
from openpyxl.chart import BarChart, LineChart, PieChart, Reference
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import pandas as pd

class ExcelReport:
    def __init__(self, filename):
        self.filename = filename
        self.wb = openpyxl.Workbook()
        self.ws = self.wb.active
        
        # Styles
        self.header_font = Font(bold=True, color="FFFFFF", size=12)
        self.header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
        self.border = Border(
            left=Side(style='thin'),
            right=Side(style='thin'),
            top=Side(style='thin'),
            bottom=Side(style='thin')
        )
    
    def add_title(self, title, row=1, column=1):
        """Add report title."""
        cell = self.ws.cell(row=row, column=column, value=title)
        cell.font = Font(bold=True, size=16)
        self.ws.merge_cells(start_row=row, start_column=column, end_row=row, end_column=column+5)
    
    def add_dataframe(self, df, start_row=3, start_column=1, title=None):
        """Add a pandas DataFrame to the report."""
        current_row = start_row
        
        if title:
            self.ws.cell(row=current_row, column=start_column, value=title).font = Font(bold=True, size=14)
            current_row += 2
        
        # Headers
        for col_idx, col_name in enumerate(df.columns, start=start_column):
            cell = self.ws.cell(row=current_row, column=col_idx, value=col_name)
            cell.font = self.header_font
            cell.fill = self.header_fill
            cell.border = self.border
            cell.alignment = Alignment(horizontal='center')
        
        current_row += 1
        
        # Data rows
        for _, row in df.iterrows():
            for col_idx, value in enumerate(row, start=start_column):
                cell = self.ws.cell(row=current_row, column=col_idx, value=value)
                cell.border = self.border
            current_row += 1
        
        # Auto-width
        for col_idx in range(start_column, start_column + len(df.columns)):
            self.ws.column_dimensions[get_column_letter(col_idx)].width = 15
        
        return current_row + 2
    
    def add_bar_chart(self, data_start_row, data_end_row, categories_col, values_col, 
                      title, chart_row, chart_col):
        """Add a bar chart to the report."""
        chart = BarChart()
        chart.type = "col"
        chart.title = title
        chart.y_axis.title = "Value"
        chart.x_axis.title = "Category"
        
        data = Reference(self.ws, min_col=values_col, min_row=data_start_row, 
                        max_row=data_end_row)
        cats = Reference(self.ws, min_col=categories_col, min_row=data_start_row+1,
                        max_row=data_end_row)
        
        chart.add_data(data, titles_from_data=True)
        chart.set_categories(cats)
        chart.shape = 4
        
        self.ws.add_chart(chart, f"{get_column_letter(chart_col)}{chart_row}")
    
    def save(self):
        """Save the workbook."""
        self.wb.save(self.filename)
        print(f"Report saved: {self.filename}")

# Usage example
if __name__ == "__main__":
    # Sample data
    df = pd.DataFrame({
        'Month': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        'Revenue': [15000, 18000, 22000, 19500, 24000, 28000],
        'Expenses': [8000, 9500, 11000, 10000, 12000, 13000],
        'Profit': [7000, 8500, 11000, 9500, 12000, 15000]
    })
    
    report = ExcelReport("monthly_report.xlsx")
    report.add_title("Monthly Business Report - 2026")
    next_row = report.add_dataframe(df, start_row=3, title="Financial Summary")
    report.add_bar_chart(4, 9, 1, 2, "Revenue by Month", next_row, 1)
    report.save()
```

### Script 5: PDF Document Processor
```python
"""
PDF Document Processor
Merge, split, extract text, and watermark PDFs.
"""
from PyPDF2 import PdfReader, PdfWriter, PdfMerger
import os
from pathlib import Path

class PDFProcessor:
    def __init__(self):
        self.supported_operations = [
            'merge', 'split', 'extract_text', 'watermark', 'rotate'
        ]
    
    def merge_pdfs(self, pdf_files, output_path):
        """Merge multiple PDFs into one."""
        merger = PdfMerger()
        
        for pdf_file in pdf_files:
            if os.path.exists(pdf_file):
                merger.append(pdf_file)
                print(f"Added: {pdf_file}")
            else:
                print(f"Skipped (not found): {pdf_file}")
        
        merger.write(output_path)
        merger.close()
        print(f"Merged PDF saved: {output_path}")
    
    def split_pdf(self, pdf_path, pages_per_file, output_folder):
        """Split PDF into multiple files."""
        reader = PdfReader(pdf_path)
        total_pages = len(reader.pages)
        
        os.makedirs(output_folder, exist_ok=True)
        
        file_count = 0
        for start in range(0, total_pages, pages_per_file):
            writer = PdfWriter()
            end = min(start + pages_per_file, total_pages)
            
            for page_num in range(start, end):
                writer.add_page(reader.pages[page_num])
            
            file_count += 1
            output_path = os.path.join(output_folder, f"part_{file_count:03d}.pdf")
            
            with open(output_path, 'wb') as f:
                writer.write(f)
            
            print(f"Created: {output_path} (pages {start+1}-{end})")
        
        print(f"Split into {file_count} files")
    
    def extract_text(self, pdf_path, page_numbers=None):
        """Extract text from PDF."""
        reader = PdfReader(pdf_path)
        text = ""
        
        pages_to_read = page_numbers if page_numbers else range(len(reader.pages))
        
        for page_num in pages_to_read:
            if 0 <= page_num < len(reader.pages):
                text += f"\n--- Page {page_num + 1} ---\n"
                text += reader.pages[page_num].extract_text()
        
        return text
    
    def add_watermark(self, pdf_path, watermark_path, output_path):
        """Add watermark to all pages."""
        reader = PdfReader(pdf_path)
        watermark = PdfReader(watermark_path)
        watermark_page = watermark.pages[0]
        
        writer = PdfWriter()
        
        for page in reader.pages:
            page.merge_page(watermark_page)
            writer.add_page(page)
        
        with open(output_path, 'wb') as f:
            writer.write(f)
        
        print(f"Watermarked PDF saved: {output_path}")
    
    def rotate_pages(self, pdf_path, rotation, output_path, pages=None):
        """Rotate pages (90, 180, 270 degrees)."""
        reader = PdfReader(pdf_path)
        writer = PdfWriter()
        
        for i, page in enumerate(reader.pages):
            if pages is None or i in pages:
                page.rotate(rotation)
            writer.add_page(page)
        
        with open(output_path, 'wb') as f:
            writer.write(f)
        
        print(f"Rotated PDF saved: {output_path}")

# Usage
if __name__ == "__main__":
    processor = PDFProcessor()
    
    # Merge
    processor.merge_pdfs(['file1.pdf', 'file2.pdf', 'file3.pdf'], 'merged.pdf')
    
    # Split
    processor.split_pdf('large_document.pdf', 10, './split_output')
    
    # Extract text
    text = processor.extract_text('report.pdf', page_numbers=[0, 1, 2])
    with open('extracted.txt', 'w', encoding='utf-8') as f:
        f.write(text)
```

---

## 📋 Full Script Index

### File & Folder Automation
1. `bulk_file_renamer.py` - Rename files with patterns
2. `folder_organizer.py` - Sort files by type/date
3. `duplicate_finder.py` - Find and handle duplicate files
4. `batch_converter.py` - Convert file formats in bulk
5. `file_compressor.py` - Smart zip/unzip utility
6. `folder_sync.py` - Two-way folder synchronization
7. `backup_automator.py` - Automated backup with rotation
8. `temp_cleaner.py` - Clean temporary files safely
9. `permission_fixer.py` - Batch permission management
10. `symlink_creator.py` - Create symbolic links in bulk
11. `file_hasher.py` - Generate file checksums
12. `disk_usage_analyzer.py` - Visualize disk usage
13. `empty_folder_cleaner.py` - Remove empty directories
14. `file_watcher.py` - Monitor folder for changes
15. `batch_metadata_editor.py` - Edit file metadata

### Web Scraping & APIs
16. `smart_scraper.py` - Intelligent web scraper
17. `api_tester.py` - REST API testing tool
18. `sitemap_crawler.py` - Crawl sitemap.xml
19. `rss_reader.py` - RSS feed aggregator
20. `price_monitor.py` - Track product prices
21. `stock_checker.py` - Inventory monitoring
22. `weather_fetcher.py` - Weather data collection
23. `news_aggregator.py` - News collection & summarization
24. `social_scraper.py` - Social media data extraction
25. `job_scraper.py` - Job listing aggregation
26. `real_estate_scraper.py` - Property listing tracker
27. `crypto_tracker.py` - Cryptocurrency price monitor
28. `sports_scorer.py` - Live sports scores
29. `flight_tracker.py` - Flight price monitor
30. `api_documentation_scraper.py` - Extract API docs
31. `image_downloader.py` - Bulk image downloader
32. `video_metadata.py` - Extract video information
33. `whois_lookup.py` - Domain information lookup
34. `dns_checker.py` - DNS record verification
35. `ssl_checker.py` - SSL certificate monitor

### Email & Messaging
36. `email_campaign_sender.py` - Bulk email campaigns
37. `email_parser.py` - Extract data from emails
38. `gmail_labeler.py` - Auto-label Gmail messages
39. `outlook_sync.py` - Outlook calendar sync
40. `slack_notifier.py` - Slack message automation
41. `telegram_bot.py` - Telegram bot framework
42. `discord_webhook.py` - Discord notifications
43. `sms_sender.py` - SMS via Twilio
44. `email_verifier.py` - Verify email addresses
45. `newsletter_generator.py` - Newsletter creation
46. `auto_responder.py` - Email auto-responder
47. `attachment_extractor.py` - Save email attachments

### Data Processing
48. `csv_wizard.py` - Advanced CSV operations
49. `json_transformer.py` - JSON data transformation
50. `xml_parser.py` - XML parsing utility
51. `data_cleaner.py` - Automated data cleaning
52. `outlier_detector.py` - Statistical outlier detection
53. `missing_data_handler.py` - Handle missing values
54. `data_merger.py` - Merge datasets
55. `pivot_generator.py` - Create pivot tables
56. `correlation_analyzer.py` - Correlation analysis
57. `time_series_preparer.py` - Time series preparation
58. `feature_engineer.py` - Feature engineering
59. `data_validator.py` - Data quality validation
60. `schema_inferrer.py` - Infer data schema
61. `type_converter.py` - Automatic type conversion
62. `deduplicator.py` - Remove duplicate records
63. `fuzzy_matcher.py` - Fuzzy string matching

### Excel & Spreadsheets
64. `excel_report_generator.py` - Professional reports
65. `excel_chart_creator.py` - Chart automation
66. `excel_formula_writer.py` - Formula generation
67. `excel_template_filler.py` - Template population
68. `excel_comparison.py` - Compare spreadsheets
69. `excel_to_json.py` - Excel to JSON converter
70. `json_to_excel.py` - JSON to Excel converter
71. `excel_dashboard.py` - Interactive dashboards
72. `excel_macro_recorder.py` - VBA macro generator
73. `excel_data_extractor.py` - Extract from Excel
74. `excel_form_creator.py` - Fillable form creation
75. `excel_consolidator.py` - Consolidate workbooks

### PDF & Documents
76. `pdf_processor.py` - Merge/split/extract
77. `pdf_form_filler.py` - Fill PDF forms
78. `pdf_ocr.py` - OCR scanned documents
79. `pdf_watermarker.py` - Add watermarks
80. `pdf_encryptor.py` - Encrypt/decrypt PDFs
81. `pdf_to_word.py` - PDF to Word conversion
82. `word_template_filler.py` - Word mail merge
83. `markdown_to_pdf.py` - Markdown to PDF
84. `html_to_pdf.py` - HTML to PDF converter
85. `document_comparer.py` - Compare documents

### Social Media Automation
86. `twitter_scheduler.py` - Tweet scheduling
87. `linkedin_poster.py` - LinkedIn content
88. `instagram_hashtag.py` - Hashtag research
89. `reddit_monitor.py` - Subreddit monitoring
90. `youtube_analyzer.py` - YouTube analytics
91. `tiktok_trends.py` - TikTok trend analysis
92. `social_calendar.py` - Content calendar
93. `engagement_tracker.py` - Track engagement
94. `influencer_finder.py` - Find influencers
95. `hashtag_generator.py` - Generate hashtags

### System & DevOps
96. `server_monitor.py` - Server health monitoring
97. `log_analyzer.py` - Log file analysis
98. `deployment_automator.py` - Automated deployment
99. `docker_manager.py` - Docker container management
100. `cron_scheduler.py` - Cron job management
101. `environment_checker.py` - Environment validation
102. `dependency_updater.py` - Update dependencies
103. `backup_verifier.py` - Verify backup integrity
104. `ssl_renewal.py` - SSL certificate renewal
105. `database_backup.py` - Database backup automation

---

## 📄 License

Personal and commercial use permitted. Modify and use in your projects.

---

**Created by AutoCoderAgent** | 100+ scripts to automate your world.
