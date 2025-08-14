"use client";

import type React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Download, Save } from "lucide-react";
import { InvoiceData, InvoiceItem } from "@/types/invoice.type";
import { hoursToDecimal } from "@/lib/utils";

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
  items: [
    { id: "1", projectName: "", totalHours: "", ratePerHour: 0, totalPrice: 0 },
  ],
  taxPercentage: 0,
};

export default function InvoiceGenerator() {
  const [data, setData] = useState<InvoiceData>(initialData);
  const saveToPDFRef = useRef(null);

  const subtotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = subtotal * (data.taxPercentage / 100);
  const total = subtotal - taxAmount;

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "totalHours" || field === "ratePerHour") {
            const hours = hoursToDecimal(updated.totalHours);
            updated.totalPrice = hours * updated.ratePerHour;
          }
          return updated;
        }
        return item;
      }),
    }));
  };

  const addItem = () => {
    const newId = Date.now().toString();
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: newId,
          projectName: "",
          totalHours: "",
          ratePerHour: 0,
          totalPrice: 0,
        },
      ],
    }));
  };

  const removeItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const downloadPDF = async () => {
    if (!saveToPDFRef.current) return;

    const element = saveToPDFRef.current;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`invoice-${data.invoiceNumber || "draft"}.pdf`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setData((prev) => ({
          ...prev,
          senderLogo: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatCurrency = (amount: number) => {
    if (data.currency === "USD") {
      return `$${amount.toFixed(2)}`;
    } else {
      const idrAmount = amount * data.usdToIdrRate;
      return `Rp ${idrAmount.toLocaleString("id-ID")}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Invoice Generator
          </h1>
          <p className="text-slate-600">
            Create professional invoices with live preview
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form Section - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sender Section */}
            <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-lg -mt-6 py-4">
                <CardTitle className="text-white">From (Sender)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <Label
                    htmlFor="senderCompany"
                    className="text-slate-700 font-medium"
                  >
                    Company Name
                  </Label>
                  <Input
                    id="senderCompany"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                    value={data.senderCompany}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        senderCompany: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    htmlFor="senderAddress"
                    className="text-slate-700 font-medium"
                  >
                    Address
                  </Label>
                  <Textarea
                    id="senderAddress"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                    value={data.senderAddress}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        senderAddress: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="senderPhone"
                      className="text-slate-700 font-medium"
                    >
                      Phone
                    </Label>
                    <Input
                      id="senderPhone"
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                      value={data.senderPhone}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          senderPhone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="senderEmail"
                      className="text-slate-700 font-medium"
                    >
                      Email
                    </Label>
                    <Input
                      id="senderEmail"
                      type="email"
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                      value={data.senderEmail}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          senderEmail: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="senderWebsite"
                    className="text-slate-700 font-medium"
                  >
                    Website
                  </Label>
                  <Input
                    id="senderWebsite"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                    value={data.senderWebsite}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        senderWebsite: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="logo" className="text-slate-700 font-medium">
                    Upload Logo
                  </Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="border-slate-300 focus:border-blue-500 file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3"
                    onChange={handleLogoUpload}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recipient Section */}
            <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-lg -mt-6 py-4">
                <CardTitle className="text-white">To (Recipient)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <Label
                    htmlFor="recipientCompany"
                    className="text-slate-700 font-medium"
                  >
                    Company Name
                  </Label>
                  <Input
                    id="recipientCompany"
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                    value={data.recipientCompany}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        recipientCompany: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    htmlFor="recipientAddress"
                    className="text-slate-700 font-medium"
                  >
                    Address
                  </Label>
                  <Textarea
                    id="recipientAddress"
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                    value={data.recipientAddress}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        recipientAddress: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="recipientPhone"
                      className="text-slate-700 font-medium"
                    >
                      Phone
                    </Label>
                    <Input
                      id="recipientPhone"
                      className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                      value={data.recipientPhone}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          recipientPhone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="recipientEmail"
                      className="text-slate-700 font-medium"
                    >
                      Email
                    </Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                      value={data.recipientEmail}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          recipientEmail: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-lg -mt-6 py-4">
                <CardTitle className="text-white">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <Label
                    htmlFor="bankAccount"
                    className="text-slate-700 font-medium"
                  >
                    Bank Account Number
                  </Label>
                  <Input
                    id="bankAccount"
                    className="border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
                    value={data.bankAccount}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        bankAccount: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    htmlFor="accountName"
                    className="text-slate-700 font-medium"
                  >
                    Account Name
                  </Label>
                  <Input
                    id="accountName"
                    className="border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
                    value={data.accountName}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        accountName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label
                    htmlFor="bankName"
                    className="text-slate-700 font-medium"
                  >
                    Bank Name
                  </Label>
                  <Input
                    id="bankName"
                    className="border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
                    value={data.bankName}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, bankName: e.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Details */}
            <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-lg -mt-6 py-4">
                <CardTitle className="text-white">Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="invoiceNumber"
                      className="text-slate-700 font-medium"
                    >
                      Invoice Number
                    </Label>
                    <Input
                      id="invoiceNumber"
                      className="border-slate-300 focus:border-purple-500 focus:ring-purple-500/20"
                      value={data.invoiceNumber}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          invoiceNumber: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="invoiceDate"
                      className="text-slate-700 font-medium"
                    >
                      Invoice Date
                    </Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      className="border-slate-300 focus:border-purple-500 focus:ring-purple-500/20"
                      value={data.invoiceDate}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          invoiceDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="currency"
                      className="text-slate-700 font-medium"
                    >
                      Currency
                    </Label>
                    <Select
                      value={data.currency}
                      onValueChange={(value: "USD" | "IDR") =>
                        setData((prev) => ({ ...prev, currency: value }))
                      }
                    >
                      <SelectTrigger className="border-slate-300 focus:border-purple-500 focus:ring-purple-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="IDR">IDR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="usdToIdrRate"
                      className="text-slate-700 font-medium"
                    >
                      USD to IDR Rate
                    </Label>
                    <Input
                      id="usdToIdrRate"
                      type="number"
                      className="border-slate-300 focus:border-purple-500 focus:ring-purple-500/20"
                      value={data.usdToIdrRate}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          usdToIdrRate: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Section */}
            <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-lg -mt-6 py-4">
                <CardTitle className="text-white">Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {data.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 border border-slate-200 rounded-lg space-y-4 bg-slate-50/50"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-800">
                        Item {index + 1}
                      </span>
                      {data.items.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <Label className="text-slate-700 font-medium">
                        Project Name
                      </Label>
                      <Input
                        className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                        value={item.projectName}
                        onChange={(e) =>
                          updateItem(item.id, "projectName", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-700 font-medium">
                          Total Hours (hh:mm)
                        </Label>
                        <Input
                          placeholder="00:00"
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                          value={item.totalHours}
                          onChange={(e) =>
                            updateItem(item.id, "totalHours", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 font-medium">
                          Rate per Hour
                        </Label>
                        <Input
                          type="number"
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                          value={item.ratePerHour}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "ratePerHour",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-700 font-medium">
                        Total Price
                      </Label>
                      <Input
                        value={formatCurrency(item.totalPrice)}
                        readOnly
                        className="bg-slate-100 border-slate-300 text-slate-600"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  onClick={addItem}
                  variant="outline"
                  className="w-full border-indigo-300 text-indigo-600 hover:bg-indigo-50 bg-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card className="border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-lg -mt-6 py-4">
                <CardTitle className="text-white">Totals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <Label
                    htmlFor="taxPercentage"
                    className="text-slate-700 font-medium"
                  >
                    Tax Percentage (%)
                  </Label>
                  <Input
                    id="taxPercentage"
                    type="number"
                    className="border-slate-300 focus:border-slate-500 focus:ring-slate-500/20"
                    value={data.taxPercentage}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        taxPercentage: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 bg-slate-50 p-4 rounded-lg">
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Tax ({data.taxPercentage}%):</span>
                    <span className="font-medium">
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                  <Separator className="bg-slate-300" />
                  <div className="flex justify-between font-bold text-lg text-slate-800">
                    <span>Total Payment:</span>
                    <span className="text-emerald-600">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={downloadPDF}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Preview Section - Right Side */}
          <div className="lg:col-span-3">
            <Card className="sticky top-4 border-slate-200 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-lg -mt-6 py-4">
                <CardTitle className="text-white">Invoice Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div
                  ref={saveToPDFRef}
                  id="invoice-preview"
                  style={{
                    backgroundColor: "#ffffff",
                    padding: "2rem",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    borderRadius: "0.5rem",
                    border: "1px solid rgb(226, 232, 240)",
                  }}
                >
                  {/* Header with Logo */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "2rem",
                    }}
                  >
                    <div>
                      {data.senderLogo && (
                        <img
                          src={data.senderLogo || "/placeholder.svg"}
                          alt="Logo"
                          style={{
                            height: "4rem",
                            width: "auto",
                            marginBottom: "1rem",
                          }}
                        />
                      )}
                      <h1
                        style={{
                          fontSize: "1.875rem",
                          fontWeight: "bold",
                          color: "rgb(30, 41, 59)",
                        }}
                      >
                        INVOICE
                      </h1>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "1.125rem",
                          fontWeight: 600,
                          color: "rgb(30, 41, 59)",
                        }}
                      >
                        #{data.invoiceNumber}
                      </div>
                      <div style={{ color: "rgb(71, 85, 105)" }}>
                        {data.invoiceDate}
                      </div>
                    </div>
                  </div>

                  {/* From/To Section */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "2rem",
                      marginBottom: "2rem",
                    }}
                  >
                    {/* From */}
                    <div>
                      <h3
                        style={{
                          fontWeight: 600,
                          color: "rgb(30, 41, 59)",
                          marginBottom: "0.5rem",
                          paddingBottom: "0.25rem",
                          borderBottom: "2px solid rgb(37, 99, 235)",
                        }}
                      >
                        From:
                      </h3>
                      <div style={{ color: "rgb(51, 65, 85)" }}>
                        <div
                          style={{ fontWeight: 500, color: "rgb(30, 41, 59)" }}
                        >
                          {data.senderCompany}
                        </div>
                        <div style={{ whiteSpace: "pre-line" }}>
                          {data.senderAddress}
                        </div>
                        {data.senderPhone && (
                          <div>Phone: {data.senderPhone}</div>
                        )}
                        {data.senderEmail && (
                          <div>Email: {data.senderEmail}</div>
                        )}
                        {data.senderWebsite && (
                          <div>Website: {data.senderWebsite}</div>
                        )}
                      </div>
                    </div>

                    {/* To */}
                    <div>
                      <h3
                        style={{
                          fontWeight: 600,
                          color: "rgb(30, 41, 59)",
                          marginBottom: "0.5rem",
                          paddingBottom: "0.25rem",
                          borderBottom: "2px solid rgb(5, 150, 105)",
                        }}
                      >
                        To:
                      </h3>
                      <div style={{ color: "rgb(51, 65, 85)" }}>
                        <div
                          style={{ fontWeight: 500, color: "rgb(30, 41, 59)" }}
                        >
                          {data.recipientCompany}
                        </div>
                        <div style={{ whiteSpace: "pre-line" }}>
                          {data.recipientAddress}
                        </div>
                        {data.recipientPhone && (
                          <div>Phone: {data.recipientPhone}</div>
                        )}
                        {data.recipientEmail && (
                          <div>Email: {data.recipientEmail}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div style={{ marginBottom: "2rem" }}>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr
                          style={{
                            background:
                              "linear-gradient(to right, rgb(241, 245, 249), rgb(226, 232, 240))",
                          }}
                        >
                          {["Project Name", "Hours", "Rate", "Total"].map(
                            (header) => (
                              <th
                                key={header}
                                style={{
                                  textAlign:
                                    header === "Project Name"
                                      ? "left"
                                      : "right",
                                  padding: "0.75rem 1rem",
                                  fontWeight: 600,
                                  color: "rgb(30, 41, 59)",
                                  borderBottom: "2px solid rgb(203, 213, 225)",
                                }}
                              >
                                {header}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {data.items.map((item, index) => (
                          <tr
                            key={item.id}
                            style={{
                              borderBottom: "1px solid rgb(226, 232, 240)",
                              backgroundColor:
                                index % 2 === 0
                                  ? "rgba(248, 250, 252, 0.5)"
                                  : "rgb(255, 255, 255)",
                            }}
                          >
                            <td
                              style={{
                                padding: "0.75rem 1rem",
                                color: "rgb(51, 65, 85)",
                              }}
                            >
                              {item.projectName}
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                padding: "0.75rem 1rem",
                                color: "rgb(51, 65, 85)",
                              }}
                            >
                              {item.totalHours}
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                padding: "0.75rem 1rem",
                                color: "rgb(51, 65, 85)",
                              }}
                            >
                              {formatCurrency(item.ratePerHour)}
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                padding: "0.75rem 1rem",
                                fontWeight: 500,
                                color: "rgb(30, 41, 59)",
                              }}
                            >
                              {formatCurrency(item.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginBottom: "2rem",
                    }}
                  >
                    <div
                      style={{
                        width: "16rem",
                        backgroundColor: "rgb(248, 250, 252)",
                        padding: "1rem",
                        borderRadius: "0.5rem",
                        border: "1px solid rgb(226, 232, 240)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0.5rem 0",
                          color: "rgb(51, 65, 85)",
                        }}
                      >
                        <span>Subtotal:</span>
                        <span style={{ fontWeight: 500 }}>
                          {formatCurrency(subtotal)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0.5rem 0",
                          color: "rgb(51, 65, 85)",
                        }}
                      >
                        <span>Tax ({data.taxPercentage}%):</span>
                        <span style={{ fontWeight: 500 }}>
                          {formatCurrency(taxAmount)}
                        </span>
                      </div>
                      <div
                        style={{
                          borderTop: "2px solid rgb(203, 213, 225)",
                          paddingTop: "0.5rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontWeight: "bold",
                            fontSize: "1.125rem",
                          }}
                        >
                          <span style={{ color: "rgb(30, 41, 59)" }}>
                            Total:
                          </span>
                          <span style={{ color: "rgb(5, 150, 105)" }}>
                            {formatCurrency(total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  {(data.bankAccount || data.accountName || data.bankName) && (
                    <div style={{ borderTop: "1px solid rgb(226, 232, 240)" }}>
                      <h3
                        style={{
                          fontWeight: 600,
                          color: "rgb(30, 41, 59)",
                          marginBottom: "0.5rem",
                          paddingBottom: "0.25rem",
                          borderBottom: "2px solid rgb(217, 119, 6)",
                        }}
                      >
                        Payment Details:
                      </h3>
                      <div
                        style={{
                          color: "rgb(51, 65, 85)",
                          backgroundColor: "rgb(255, 251, 235)",
                          padding: "1rem",
                          borderRadius: "0.5rem",
                        }}
                      >
                        {data.bankName && (
                          <div>
                            <span style={{ fontWeight: 500 }}>Bank:</span>{" "}
                            {data.bankName}
                          </div>
                        )}
                        {data.accountName && (
                          <div>
                            <span style={{ fontWeight: 500 }}>
                              Account Name:
                            </span>{" "}
                            {data.accountName}
                          </div>
                        )}
                        {data.bankAccount && (
                          <div>
                            <span style={{ fontWeight: 500 }}>
                              Account Number:
                            </span>{" "}
                            {data.bankAccount}
                          </div>
                        )}
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
  );
}
