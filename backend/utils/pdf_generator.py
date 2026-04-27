from jinja2 import Template
import os
from datetime import datetime

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; color: #1f2937; line-height: 1.5; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .brand { font-size: 24px; font-weight: bold; color: #4f46e5; }
        .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        .table th { background: #f9fafb; padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; }
        .table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .totals { margin-left: auto; width: 250px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 12px; }
        .footer { margin-top: 50px; font-size: 12px; color: #6b7280; text-align: center; }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="header">
            <div class="brand">{{ business.name }}</div>
            <div>
                <strong>Invoice #{{ invoice.invoice_number }}</strong><br>
                Date: {{ invoice.date.strftime('%d %b, %Y') }}<br>
                Due: {{ invoice.due_date.strftime('%d %b, %Y') }}
            </div>
        </div>

        <div class="details">
            <div>
                <strong>From:</strong><br>
                {{ business.name }}<br>
                {{ business.address }}<br>
                GSTIN: {{ business.gstin }}
            </div>
            <div>
                <strong>Bill To:</strong><br>
                {{ client.name }}<br>
                {{ client.address }}<br>
                GSTIN: {{ client.gstin }}
            </div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                {% for item in invoice.line_items %}
                <tr>
                    <td>{{ item.description }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>₹{{ "{:,.2f}".format(item.price) }}</td>
                    <td>₹{{ "{:,.2f}".format(item.amount) }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>

        <div class="totals">
            <div class="total-row">
                <span>Subtotal</span>
                <span>₹{{ "{:,.2f}".format(invoice.subtotal) }}</span>
            </div>
            {% if invoice.tax_amount > 0 %}
            <div class="total-row">
                <span>Tax ({{ invoice.tax_rate }}%)</span>
                <span>₹{{ "{:,.2f}".format(invoice.tax_amount) }}</span>
            </div>
            {% endif %}
            <div class="total-row grand-total">
                <span>Total</span>
                <span>₹{{ "{:,.2f}".format(invoice.total_amount) }}</span>
            </div>
        </div>

        <div class="footer">
            {{ invoice.notes or "Thank you for your business!" }}
        </div>
    </div>
</body>
</html>
"""

def generate_invoice_html(business, client, invoice):
    template = Template(HTML_TEMPLATE)
    return template.render(business=business, client=client, invoice=invoice)

# We'll use this function to generate a PDF file if WeasyPrint is available
def generate_invoice_pdf(business, client, invoice, output_path):
    html_content = generate_invoice_html(business, client, invoice)
    
    try:
        from weasyprint import HTML
        HTML(string=html_content).write_pdf(output_path)
        return True
    except ImportError:
        # Fallback: Just save as HTML for now if WeasyPrint is missing
        # In a real environment, we'd ensure system deps for WeasyPrint
        with open(output_path.replace('.pdf', '.html'), 'w') as f:
            f.write(html_content)
        return False
