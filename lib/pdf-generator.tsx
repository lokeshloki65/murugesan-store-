import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import type { Sale } from "@/types/product"

export interface StoreInfo {
  name: string
  address: string
  phone: string
  email: string
  gst?: string
}

export const generateReceiptPDF = async (sale: Sale, storeInfo?: StoreInfo): Promise<Blob> => {
  const defaultStoreInfo = {
    name: "Murugesan Store",
    address: "123 Main Street, Chennai, Tamil Nadu 600001",
    phone: "+91 98765 43210",
    email: "info@murugensanstore.com",
    gst: "33XXXXX1234X1ZX",
  }

  const store = storeInfo || defaultStoreInfo

  // Create a temporary div for the receipt
  const tempDiv = document.createElement("div")
  tempDiv.style.position = "absolute"
  tempDiv.style.left = "-9999px"
  tempDiv.style.top = "-9999px"
  tempDiv.style.width = "300px"
  tempDiv.style.backgroundColor = "white"
  tempDiv.style.padding = "20px"
  tempDiv.style.fontFamily = "monospace"
  tempDiv.style.fontSize = "12px"
  tempDiv.style.lineHeight = "1.4"

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  // Generate receipt HTML
  tempDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px;">
      <h1 style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase;">${store.name}</h1>
      <p style="margin: 2px 0; font-size: 11px;">${store.address}</p>
      <p style="margin: 2px 0; font-size: 11px;">Phone: ${store.phone}</p>
      <p style="margin: 2px 0; font-size: 11px;">Email: ${store.email}</p>
      ${store.gst ? `<p style="margin: 2px 0; font-size: 11px;">GST: ${store.gst}</p>` : ""}
    </div>

    <div style="margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
        <span>Receipt #:</span>
        <span style="font-weight: bold;">${sale.id.slice(-8).toUpperCase()}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
        <span>Date:</span>
        <span>${formatDate(sale.timestamp)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
        <span>Payment:</span>
        <span style="text-transform: uppercase;">${sale.paymentMethod}</span>
      </div>
      ${
        sale.customerInfo?.name
          ? `<div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
               <span>Customer:</span>
               <span>${sale.customerInfo.name}</span>
             </div>`
          : ""
      }
    </div>

    <div style="margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #000; padding-bottom: 5px;">
        <span style="width: 40%;">ITEM</span>
        <span style="width: 15%; text-align: center;">QTY</span>
        <span style="width: 20%; text-align: right;">RATE</span>
        <span style="width: 25%; text-align: right;">AMOUNT</span>
      </div>
      
      ${sale.items
        .map(
          (item) => `
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <span style="width: 40%; font-size: 11px; line-height: 1.3;">${item.name}</span>
            <span style="width: 15%; text-align: center;">${item.quantity}</span>
            <span style="width: 20%; text-align: right;">${formatCurrency(item.price)}</span>
            <span style="width: 25%; text-align: right; font-weight: bold;">${formatCurrency(
              item.price * item.quantity,
            )}</span>
          </div>
          ${
            item.category
              ? `<div style="font-size: 10px; color: #666; margin-left: 0; margin-top: 2px;">(${item.category})</div>`
              : ""
          }
        </div>
      `,
        )
        .join("")}
    </div>

    <div style="border-top: 2px solid #000; padding-top: 10px; margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span>Subtotal:</span>
        <span>${formatCurrency(sale.subtotal)}</span>
      </div>
      
      ${
        sale.discount > 0
          ? `<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
               <span>Discount:</span>
               <span>-${formatCurrency(sale.discount)}</span>
             </div>`
          : ""
      }
      
      ${
        sale.tax > 0
          ? `<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
               <span>Tax:</span>
               <span>${formatCurrency(sale.tax)}</span>
             </div>`
          : ""
      }
      
      <div style="border-top: 1px solid #000; margin: 8px 0; padding-top: 8px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px;">
          <span>TOTAL:</span>
          <span>${formatCurrency(sale.total)}</span>
        </div>
      </div>
    </div>

    <div style="text-align: center; font-size: 11px; border-top: 1px solid #000; padding-top: 15px;">
      <p style="margin: 5px 0; font-weight: bold;">Thank you for shopping with us!</p>
      <p style="margin: 5px 0;">Visit us again soon</p>
      <p style="margin: 5px 0;">For support: ${store.phone}</p>
      
      <div style="margin: 15px auto; width: 60px; height: 60px; border: 2px solid #000; display: flex; align-items: center; justify-content: center; font-size: 8px;">
        QR CODE
      </div>
      
      <p style="margin: 5px 0; font-size: 10px;">Scan for digital receipt</p>
    </div>
  `

  document.body.appendChild(tempDiv)

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(tempDiv, {
      width: 300,
      height: tempDiv.scrollHeight,
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
    })

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, (tempDiv.scrollHeight * 80) / 300], // 80mm width, proportional height
    })

    const imgData = canvas.toDataURL("image/png")
    pdf.addImage(imgData, "PNG", 0, 0, 80, (tempDiv.scrollHeight * 80) / 300)

    // Return PDF as blob
    return pdf.output("blob")
  } finally {
    // Clean up
    document.body.removeChild(tempDiv)
  }
}

export const downloadReceiptPDF = async (sale: Sale, storeInfo?: StoreInfo): Promise<void> => {
  try {
    const pdfBlob = await generateReceiptPDF(sale, storeInfo)
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `receipt-${sale.id.slice(-8).toUpperCase()}-${new Date().toISOString().split("T")[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error("Failed to generate PDF receipt")
  }
}
