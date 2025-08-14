"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Download, Save } from "lucide-react"

interface InvoiceItem {
  id: string
  projectName: string
  totalHours: string
  ratePerHour: number
  totalPrice: number
}

interface InvoiceData {
  // Sender
  senderCompany: string
  senderAddress: string
  senderPhone: string
  senderEmail: string
  senderWebsite: string
  senderLogo: string

  // Recipient
  recipientCompany: string
  recipientAddress: string
  recipientPhone: string
  recipientEmail: string

  // Payment Details
  bankAccount: string
  accountName: string
  bankName: string

  // Invoice Details
  invoiceNumber: string
  invoiceDate: string
  currency: "USD" | "IDR"
  usdToIdrRate: number

  // Items
  items: InvoiceItem[]

  // Totals
  taxPercentage: number
}

const initialData: InvoiceData = {
  senderCompany: "",
  senderAddress: "",
  senderPhone: "",
  senderEmail: "",
  senderWebsite: "",
  senderLogo: "",
  recipientCompany: "",
  recipientAddress: "",
  recipientPhone: "",
  recipientEmail: "",
  bankAccount: "",
  accountName: "",
  bankName: "",
  invoiceNumber: "",
  invoiceDate: new Date().toISOString().split("T")[0],
  currency: "USD",
  usdToIdrRate: 15000,
  items: [{ id: "1", projectName: "", totalHours: "", ratePerHour: 0, totalPrice: 0 }],
  taxPercentage: 0,
}

export default function InvoiceGenerator() {
  const [data, setData] = useState<InvoiceData>(initialData)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("invoice-draft")
    if (saved) {
      try {
        setData(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load saved draft")
      }
    }
  }, [])

  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0)
  const taxAmount = subtotal * (data.taxPercentage / 100)
  const total = subtotal + taxAmount

  // Convert hours string (hh:mm) to decimal
  const hoursToDecimal = (hoursStr: string): number => {
    if (!hoursStr) return 0
    const parts = hoursStr.split(":")
    const hours = Number.parseInt(parts[0] || "0")
    const minutes = Number.parseInt(parts[1] || "0")
    return hours + minutes / 60
  }

  // Update item calculations
  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "totalHours" || field === "ratePerHour") {
            const hours = hoursToDecimal(updated.totalHours)
            updated.totalPrice = hours * updated.ratePerHour
          }
          return updated
        }
        return item
      }),
    }))
  }

  const addItem = () => {
    const newId = Date.now().toString()
    setData((prev) => ({
      ...prev,
      items: [...prev.items, { id: newId, projectName: "", totalHours: "", ratePerHour: 0, totalPrice: 0 }],
    }))
  }

  const removeItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }))
  }

  const saveDraft = () => {
    localStorage.setItem("invoice-draft", JSON.stringify(data))
    alert("Draft saved successfully!")
  }

  const downloadPDF = () => {
    window.print()
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setData((prev) => ({ ...prev, senderLogo: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const formatCurrency = (amount: number) => {
    if (data.currency === "USD") {
      return `$${amount.toFixed(2)}`
    } else {
      const idrAmount = amount * data.usdToIdrRate
      return `Rp ${idrAmount.toLocaleString("id-ID")}`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Invoice Generator</h1>
          <p className="text-gray-600">Create professional invoices with live preview</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form Section - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sender Section */}
            <Card>
              <CardHeader>
                <CardTitle>From (Sender)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="senderCompany">Company Name</Label>
                  <Input
                    id="senderCompany"
                    value={data.senderCompany}
                    onChange={(e) => setData((prev) => ({ ...prev, senderCompany: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="senderAddress">Address</Label>
                  <Textarea
                    id="senderAddress"
                    value={data.senderAddress}
                    onChange={(e) => setData((prev) => ({ ...prev, senderAddress: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="senderPhone">Phone</Label>
                    <Input
                      id="senderPhone"
                      value={data.senderPhone}
                      onChange={(e) => setData((prev) => ({ ...prev, senderPhone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="senderEmail">Email</Label>
                    <Input
                      id="senderEmail"
                      type="email"
                      value={data.senderEmail}
                      onChange={(e) => setData((prev) => ({ ...prev, senderEmail: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="senderWebsite">Website</Label>
                  <Input
                    id="senderWebsite"
                    value={data.senderWebsite}
                    onChange={(e) => setData((prev) => ({ ...prev, senderWebsite: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="logo">Upload Logo</Label>
                  <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} />
                </div>
              </CardContent>
            </Card>

            {/* Recipient Section */}
            <Card>
              <CardHeader>
                <CardTitle>To (Recipient)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recipientCompany">Company Name</Label>
                  <Input
                    id="recipientCompany"
                    value={data.recipientCompany}
                    onChange={(e) => setData((prev) => ({ ...prev, recipientCompany: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="recipientAddress">Address</Label>
                  <Textarea
                    id="recipientAddress"
                    value={data.recipientAddress}
                    onChange={(e) => setData((prev) => ({ ...prev, recipientAddress: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipientPhone">Phone</Label>
                    <Input
                      id="recipientPhone"
                      value={data.recipientPhone}
                      onChange={(e) => setData((prev) => ({ ...prev, recipientPhone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipientEmail">Email</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      value={data.recipientEmail}
                      onChange={(e) => setData((prev) => ({ ...prev, recipientEmail: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bankAccount">Bank Account Number</Label>
                  <Input
                    id="bankAccount"
                    value={data.bankAccount}
                    onChange={(e) => setData((prev) => ({ ...prev, bankAccount: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={data.accountName}
                    onChange={(e) => setData((prev) => ({ ...prev, accountName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={data.bankName}
                    onChange={(e) => setData((prev) => ({ ...prev, bankName: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={data.invoiceNumber}
                      onChange={(e) => setData((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={data.invoiceDate}
                      onChange={(e) => setData((prev) => ({ ...prev, invoiceDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={data.currency}
                      onValueChange={(value: "USD" | "IDR") => setData((prev) => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="IDR">IDR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="usdToIdrRate">USD to IDR Rate</Label>
                    <Input
                      id="usdToIdrRate"
                      type="number"
                      value={data.usdToIdrRate}
                      onChange={(e) => setData((prev) => ({ ...prev, usdToIdrRate: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Section */}
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.items.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Item {index + 1}</span>
                      {data.items.length > 1 && (
                        <Button variant="outline" size="sm" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <Label>Project Name</Label>
                      <Input
                        value={item.projectName}
                        onChange={(e) => updateItem(item.id, "projectName", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Total Hours (hh:mm)</Label>
                        <Input
                          placeholder="00:00"
                          value={item.totalHours}
                          onChange={(e) => updateItem(item.id, "totalHours", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Rate per Hour</Label>
                        <Input
                          type="number"
                          value={item.ratePerHour}
                          onChange={(e) => updateItem(item.id, "ratePerHour", Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Total Price</Label>
                      <Input value={formatCurrency(item.totalPrice)} readOnly className="bg-gray-50" />
                    </div>
                  </div>
                ))}
                <Button onClick={addItem} variant="outline" className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardHeader>
                <CardTitle>Totals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="taxPercentage">Tax Percentage (%)</Label>
                  <Input
                    id="taxPercentage"
                    type="number"
                    value={data.taxPercentage}
                    onChange={(e) => setData((prev) => ({ ...prev, taxPercentage: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({data.taxPercentage}%):</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Payment:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button onClick={saveDraft} variant="outline" className="flex-1 bg-transparent">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={downloadPDF} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Preview Section - Right Side */}
          <div className="lg:col-span-3">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Invoice Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-8 shadow-lg rounded-lg" id="invoice-preview">
                  {/* Header with Logo */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      {data.senderLogo && (
                        <img src={data.senderLogo || "/placeholder.svg"} alt="Logo" className="h-16 w-auto mb-4" />
                      )}
                      <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">#{data.invoiceNumber}</div>
                      <div className="text-gray-600">{data.invoiceDate}</div>
                    </div>
                  </div>

                  {/* From/To Section */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">From:</h3>
                      <div className="text-gray-700">
                        <div className="font-medium">{data.senderCompany}</div>
                        <div className="whitespace-pre-line">{data.senderAddress}</div>
                        {data.senderPhone && <div>Phone: {data.senderPhone}</div>}
                        {data.senderEmail && <div>Email: {data.senderEmail}</div>}
                        {data.senderWebsite && <div>Website: {data.senderWebsite}</div>}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">To:</h3>
                      <div className="text-gray-700">
                        <div className="font-medium">{data.recipientCompany}</div>
                        <div className="whitespace-pre-line">{data.recipientAddress}</div>
                        {data.recipientPhone && <div>Phone: {data.recipientPhone}</div>}
                        {data.recipientEmail && <div>Email: {data.recipientEmail}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="mb-8">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-300">
                          <th className="text-left py-2 font-semibold">Project Name</th>
                          <th className="text-right py-2 font-semibold">Hours</th>
                          <th className="text-right py-2 font-semibold">Rate</th>
                          <th className="text-right py-2 font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.items.map((item) => (
                          <tr key={item.id} className="border-b border-gray-200">
                            <td className="py-3">{item.projectName}</td>
                            <td className="text-right py-3">{item.totalHours}</td>
                            <td className="text-right py-3">{formatCurrency(item.ratePerHour)}</td>
                            <td className="text-right py-3">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end mb-8">
                    <div className="w-64">
                      <div className="flex justify-between py-2">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span>Tax ({data.taxPercentage}%):</span>
                        <span>{formatCurrency(taxAmount)}</span>
                      </div>
                      <div className="border-t-2 border-gray-300 pt-2 mt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span>{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  {(data.bankAccount || data.accountName || data.bankName) && (
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Payment Details:</h3>
                      <div className="text-gray-700">
                        {data.bankName && <div>Bank: {data.bankName}</div>}
                        {data.accountName && <div>Account Name: {data.accountName}</div>}
                        {data.bankAccount && <div>Account Number: {data.bankAccount}</div>}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
