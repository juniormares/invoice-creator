import React from 'react';
import { Button } from './button';

// Define the preview invoice data type
interface InvoicePreviewData {
  customer: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerAddress?: string;
  };
  items: Array<{
    id: number;
    productName: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
}

// PDF Preview Button Component
interface InvoicePreviewPDFButtonProps {
  customer: any;
  invoiceItems: Array<{
    id: number;
    productName: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  buttonText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const InvoicePreviewPDFButton: React.FC<InvoicePreviewPDFButtonProps> = ({ 
  customer,
  invoiceItems,
  subtotal,
  tax,
  total,
  buttonText = "Preview PDF",
  variant = "outline",
  size = "default"
}) => {
  const [isClient, setIsClient] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if we have enough data to generate a preview
  const hasValidData = customer && invoiceItems.some(item => item.productName);

  const generatePDF = async () => {
    if (!isClient || !hasValidData) return;
    
    setIsGenerating(true);
    
    try {
      // Dynamic import to avoid SSR issues
      const { Document, Page, Text, View, StyleSheet, pdf, Image } = await import('@react-pdf/renderer');
      
      // Function to convert image to base64
      const getImageAsBase64 = async (imagePath: string): Promise<string> => {
        try {
          const response = await fetch(imagePath);
          const blob = await response.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.warn('Could not load logo image:', error);
          return '';
        }
      };

      // Get the logo as base64
      const logoBase64 = await getImageAsBase64('/companyItems/logo.png');
      
      // Define styles for the PDF matching Sand Burr LLC design
      const styles = StyleSheet.create({
        page: {
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          padding: 40,
          fontFamily: 'Helvetica',
          fontSize: 10,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 30,
          paddingBottom: 20,
          borderBottom: 1,
          borderBottomColor: '#E5E5E5',
        },
        companySection: {
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '50%',
        },
        companyName: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#2D5016',
          marginBottom: 8,
        },
        companyAddress: {
          fontSize: 10,
          color: '#666666',
          lineHeight: 1.4,
        },
        invoiceSection: {
          flexDirection: 'column',
          alignItems: 'flex-end',
          width: '50%',
        },
        logo: {
          width: 60,
          height: 60,
          marginBottom: 10,
          objectFit: 'contain',
        },
        invoiceTitle: {
          fontSize: 28,
          fontWeight: 'bold',
          color: '#333333',
          marginBottom: 10,
        },
        invoiceDetails: {
          fontSize: 11,
          color: '#666666',
          textAlign: 'right',
          lineHeight: 1.4,
        },
        draftWatermark: {
          fontSize: 12,
          color: '#FF6B6B',
          fontWeight: 'bold',
          marginTop: 5,
        },
        billToSection: {
          marginBottom: 25,
        },
        billToTitle: {
          fontSize: 12,
          fontWeight: 'bold',
          color: '#333333',
          marginBottom: 8,
        },
        billToContent: {
          fontSize: 10,
          color: '#666666',
          lineHeight: 1.4,
        },
        tableContainer: {
          marginBottom: 20,
        },
        tableHeader: {
          flexDirection: 'row',
          backgroundColor: '#4A9B8E',
          padding: 8,
          marginBottom: 1,
        },
        tableHeaderCell: {
          color: '#FFFFFF',
          fontSize: 10,
          fontWeight: 'bold',
          textAlign: 'center',
        },
        tableRow: {
          flexDirection: 'row',
          borderBottom: 1,
          borderBottomColor: '#E5E5E5',
          padding: 8,
          minHeight: 30,
        },
        tableCell: {
          fontSize: 9,
          color: '#333333',
          textAlign: 'center',
          paddingVertical: 4,
        },
        tableCellLeft: {
          textAlign: 'left',
        },
        tableCellRight: {
          textAlign: 'right',
        },
        col1: { width: '40%' },
        col2: { width: '15%' },
        col3: { width: '15%' },
        col4: { width: '15%' },
        col5: { width: '15%' },
        totalsSection: {
          flexDirection: 'column',
          alignItems: 'flex-end',
          marginTop: 20,
          paddingTop: 15,
          borderTop: 1,
          borderTopColor: '#E5E5E5',
        },
        totalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: 200,
          marginBottom: 5,
          paddingVertical: 2,
        },
        totalLabel: {
          fontSize: 11,
          color: '#666666',
        },
        totalValue: {
          fontSize: 11,
          color: '#333333',
          fontWeight: 'bold',
        },
        finalTotalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: 200,
          marginTop: 8,
          paddingTop: 8,
          paddingVertical: 4,
          borderTop: 2,
          borderTopColor: '#4A9B8E',
        },
        finalTotalLabel: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#333333',
        },
        finalTotalValue: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#2D5016',
        },
        footer: {
          position: 'absolute',
          bottom: 30,
          left: 40,
          right: 40,
          textAlign: 'center',
          fontSize: 9,
          color: '#999999',
          borderTop: 1,
          borderTopColor: '#E5E5E5',
          paddingTop: 10,
        },
      });

      const invoiceData: InvoicePreviewData = {
        customer: {
          customerName: customer.customerName,
          customerEmail: customer.customerEmail,
          customerPhone: customer.customerPhone,
          customerAddress: customer.customerAddress,
        },
        items: invoiceItems,
        subtotal,
        tax,
        total,
      };

      // Create the PDF document
      const InvoicePreviewPDFDocument = (
        <Document>
          <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.companySection}>
                <Text style={styles.companyName}>SAND BURR LLC</Text>
                <Text style={styles.companyAddress}>
                  1333 N Starkweather{'\n'}
                  Pampa TX 79065{'\n'}
                  United States{'\n\n'}
                  Jose Luis Lujan{'\n'}
                  8066630625{'\n'}
                  timolujan@gmail.com
                </Text>
              </View>
              <View style={styles.invoiceSection}>
                {logoBase64 && (
                  <Image
                    style={styles.logo}
                    src={logoBase64}
                  />
                )}
                <Text style={styles.invoiceTitle}>INVOICE PREVIEW</Text>
                <Text style={styles.invoiceDetails}>
                  Invoice #: DRAFT{'\n'}
                  Issue date: {new Date().toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
                <Text style={styles.draftWatermark}>DRAFT - NOT FINAL</Text>
              </View>
            </View>

            {/* Bill To Section */}
            <View style={styles.billToSection}>
              <Text style={styles.billToTitle}>BILL TO</Text>
              <Text style={styles.billToContent}>
                {invoiceData.customer.customerName}{'\n'}
                {invoiceData.customer.customerEmail}
                {invoiceData.customer.customerPhone && `\n${invoiceData.customer.customerPhone}`}
                {invoiceData.customer.customerAddress && `\n${invoiceData.customer.customerAddress}`}
              </Text>
            </View>

            {/* Items Table */}
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.col1, styles.tableCellLeft]}>
                  DESCRIPTION
                </Text>
                <Text style={[styles.tableHeaderCell, styles.col2]}>
                  QTY
                </Text>
                <Text style={[styles.tableHeaderCell, styles.col3]}>
                  RATE
                </Text>
                <Text style={[styles.tableHeaderCell, styles.col4]}>
                  AMOUNT ($)
                </Text>
                <Text style={[styles.tableHeaderCell, styles.col5]}>
                  TOTAL ($)
                </Text>
              </View>

              {/* Table Rows */}
              {invoiceData.items.filter(item => item.productName).map((item) => (
                <View style={styles.tableRow} key={item.id}>
                  <Text style={[styles.tableCell, styles.col1, styles.tableCellLeft]}>
                    {item.productName}
                  </Text>
                  <Text style={[styles.tableCell, styles.col2]}>
                    {item.quantity}
                  </Text>
                  <Text style={[styles.tableCell, styles.col3]}>
                    ${item.rate.toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCell, styles.col4, styles.tableCellRight]}>
                    ${item.rate.toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCell, styles.col5, styles.tableCellRight]}>
                    ${item.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Totals Section */}
            <View style={styles.totalsSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>${invoiceData.subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax:</Text>
                <Text style={styles.totalValue}>${invoiceData.tax.toFixed(2)}</Text>
              </View>
              <View style={styles.finalTotalRow}>
                <Text style={styles.finalTotalLabel}>AMOUNT DUE (USD)</Text>
                <Text style={styles.finalTotalValue}>${invoiceData.total.toFixed(2)}</Text>
              </View>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
              Thank you for your business! • Status: Draft • Sand Burr LLC
            </Text>
          </Page>
        </Document>
      );

      // Generate the PDF blob
      const blob = await pdf(InvoicePreviewPDFDocument).toBlob();
      
      // Create a URL for the blob and open it in a new tab
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      
      // Clean up the URL after a short delay to allow the browser to load it
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      // If popup was blocked, fallback to download
      if (!newWindow) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `sand-burr-invoice-preview-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isClient) {
    return (
      <Button 
        variant={variant} 
        size={size}
        disabled={true}
      >
        Loading...
      </Button>
    );
  }
  
  if (!hasValidData) {
    return (
      <Button 
        variant={variant} 
        size={size}
        disabled={true}
      >
        Select customer and add items to preview
      </Button>
    );
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      disabled={isGenerating}
      onClick={generatePDF}
    >
      {isGenerating ? 'Generating...' : buttonText}
    </Button>
  );
};

export default InvoicePreviewPDFButton; 