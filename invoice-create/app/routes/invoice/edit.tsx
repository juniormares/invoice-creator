import { NavBar } from "~/components/ui/navBar"
import { Button } from "~/components/ui/button"
import { getCustomers } from "~/scripts/customer_scripts";
import { getProducts } from "~/scripts/product_scripts";
import { getInvoiceById, updateInvoice } from "~/scripts/invoices_scripts";
import { useLoaderData, useNavigate, useActionData, Form } from "react-router";
import * as React from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "~/components/ui/command"
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "~/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "~/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";

export async function loader({ params }: { params: { id: string } }) {
    const invoiceId = parseInt(params.id);
    const [invoice, customers, products] = await Promise.all([
        getInvoiceById(invoiceId),
        getCustomers(),
        getProducts()
    ]);
    
    if (!invoice) {
        throw new Response("Invoice not found", { status: 404 });
    }
    
    return { invoice, customers, products };
}

export async function action({ request, params }: { request: Request; params: { id: string } }) {
    const invoiceId = parseInt(params.id);
    const formData = await request.formData();
    const invoiceDataString = formData.get("invoiceData") as string;
    
    if (!invoiceDataString) {
        return { success: false, error: 'No invoice data provided' };
    }
    
    try {
        const invoiceData = JSON.parse(invoiceDataString);
        
        // For simplicity, we'll update basic invoice info only
        // In a real app, you might want to handle item updates more sophisticatedly
        const updatedInvoice = await updateInvoice(invoiceId, {
            customerId: invoiceData.customerId,
            subtotal: invoiceData.subtotal,
            tax: invoiceData.tax,
            totalPrice: invoiceData.totalPrice
        });
        
        return { success: true, invoice: updatedInvoice };
    } catch (error) {
        console.error('Error updating invoice:', error);
        return { success: false, error: 'Failed to update invoice: ' + (error instanceof Error ? error.message : 'Unknown error') };
    }
}

export default function InvoiceEdit() {
    const { invoice, customers, products } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const actionData = useActionData<typeof action>();
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(invoice.customerId.toString());
    
    // Initialize invoice items from existing invoice
    const [invoiceItems, setInvoiceItems] = React.useState(
        invoice.invoiceItems.map((item: any, index: number) => ({
            id: index + 1,
            productId: item.productId.toString(),
            productName: item.product.productName,
            quantity: item.quantity,
            rate: item.unitPrice,
            amount: item.totalPrice
        }))
    );

    // State for tracking which product dropdowns are open
    const [productOpenStates, setProductOpenStates] = React.useState<{[key: number]: boolean}>({});

    // Handle successful submission
    React.useEffect(() => {
        if (actionData?.success) {
            alert('Invoice updated successfully!');
            navigate('/invoice');
        } else if (actionData?.error) {
            alert(actionData.error);
        }
    }, [actionData, navigate]);

    // Function to toggle product dropdown state
    const toggleProductOpen = (itemId: number, isOpen: boolean) => {
        setProductOpenStates(prev => ({
            ...prev,
            [itemId]: isOpen
        }));
    };

    // Function to add new invoice item
    const addInvoiceItem = () => {
        const newId = Math.max(...invoiceItems.map(item => item.id)) + 1;
        setInvoiceItems([...invoiceItems, { 
            id: newId, 
            productId: "", 
            productName: "", 
            quantity: 1, 
            rate: 0, 
            amount: 0 
        }]);
        setProductOpenStates(prev => ({
            ...prev,
            [newId]: false
        }));
    };

    // Function to remove invoice item
    const removeInvoiceItem = (id: number) => {
        if (invoiceItems.length > 1) {
            setInvoiceItems(invoiceItems.filter(item => item.id !== id));
            setProductOpenStates(prev => {
                const newStates = { ...prev };
                delete newStates[id];
                return newStates;
            });
        }
    };

    // Function to update invoice item
    const updateInvoiceItem = (id: number, field: string, value: any) => {
        setInvoiceItems(invoiceItems.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                
                if (field === 'productId') {
                    const selectedProduct = products.find((p: any) => p.productId.toString() === value);
                    if (selectedProduct) {
                        updatedItem.productName = selectedProduct.productName;
                        updatedItem.rate = selectedProduct.productPrice;
                        updatedItem.amount = updatedItem.quantity * selectedProduct.productPrice;
                    }
                }
                
                if (field === 'quantity') {
                    const qty = value === '' ? 0 : value;
                    updatedItem.amount = qty * updatedItem.rate;
                }
                
                if (field === 'rate') {
                    const rate = value === '' ? 0 : value;
                    updatedItem.amount = updatedItem.quantity * rate;
                }
                
                return updatedItem;
            }
            return item;
        }));
    };

    // Calculate totals
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        if (!value) {
            e.preventDefault();
            alert('Please select a customer');
            return;
        }
        
        const validItems = invoiceItems.filter(item => item.productId);
        if (validItems.length === 0) {
            e.preventDefault();
            alert('Please add at least one product to the invoice');
            return;
        }
        
        const invalidItems = validItems.filter(item => 
            !item.quantity || item.quantity <= 0 || !item.rate || item.rate <= 0
        );
        
        if (invalidItems.length > 0) {
            e.preventDefault();
            alert('Please ensure all items have valid quantities and rates');
            return;
        }
        
        const invoiceData = {
            customerId: parseInt(value),
            items: validItems.map(item => ({
                productId: parseInt(item.productId),
                quantity: item.quantity,
                unitPrice: item.rate,
                totalPrice: item.amount
            })),
            subtotal: subtotal,
            tax: tax,
            totalPrice: total
        };
        
        const form = e.target as HTMLFormElement;
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'invoiceData';
        hiddenInput.value = JSON.stringify(invoiceData);
        form.appendChild(hiddenInput);
    };

    return (
        <div className="main-layout">
            <NavBar />
            <main className="main-content animate-fade-in">
                <div className="invoice-container">
                    <div className="invoice-header">
                        <h2 className="invoice-title">Edit Invoice</h2>
                        <p className="invoice-number">#{invoice.invoiceId.toString().padStart(4, '0')}</p>
                    </div>
                    
                    <div className="invoice-details">
                        <Form className="form-container" method="post" onSubmit={handleSubmit}>
                            <h3 className="invoice-section-title">Customer Information</h3>
                            <div className="form-group">
                                <label className="form-label">Select Customer</label>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-full justify-between form-select"
                                            type="button"
                                        >
                                            {value
                                                ? customers.find((customer: any) => customer.customerId.toString() === value)?.customerName
                                                : "Select customer..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search customer..." className="h-9" />
                                            <CommandList>
                                                <CommandEmpty>No customer found.</CommandEmpty>
                                                <CommandGroup>
                                                    {customers.map((customer: any) => (
                                                        <CommandItem
                                                            key={customer.customerId}
                                                            value={customer.customerId.toString()}
                                                            onSelect={(currentValue) => {
                                                                setValue(currentValue === value ? "" : currentValue);
                                                                setOpen(false);
                                                            }}
                                                        >
                                                            {customer.customerName}
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto h-4 w-4",
                                                                    value === customer.customerId.toString() ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            
                            <div className="invoice-section">
                                <h3 className="invoice-section-title">Invoice Items</h3>
                                <div className="table-container">
                                    <Table>
                                        <TableHeader className="invoice-items-header">
                                            <TableRow>
                                                <TableHead className="w-1/4">Product</TableHead>
                                                <TableHead className="w-1/3">Description</TableHead>
                                                <TableHead className="w-20 text-center">Qty</TableHead>
                                                <TableHead className="w-24 text-right">Rate</TableHead>
                                                <TableHead className="w-24 text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoiceItems.map((item) => {
                                                const selectedProduct = products.find((product: any) => product.productId.toString() === item.productId);
                                                const isProductOpen = productOpenStates[item.id] || false;
                                                
                                                return (
                                                    <TableRow key={item.id} className="invoice-item-row">
                                                        <TableCell className="w-1/4">
                                                            <Popover open={isProductOpen} onOpenChange={(open) => toggleProductOpen(item.id, open)}>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        aria-expanded={isProductOpen}
                                                                        className="w-full justify-between form-select h-10"
                                                                        type="button"
                                                                    >
                                                                        {item.productId
                                                                            ? products.find((product: any) => product.productId.toString() === item.productId)?.productName
                                                                            : "Select product..."}
                                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-full p-0">
                                                                    <Command>
                                                                        <CommandInput placeholder="Search product..." className="h-9" />
                                                                        <CommandList>
                                                                            <CommandEmpty>No product found.</CommandEmpty>
                                                                            <CommandGroup>
                                                                                {products.map((product: any) => (
                                                                                    <CommandItem
                                                                                        key={product.productId}
                                                                                        value={product.productId.toString()}
                                                                                        onSelect={(currentValue) => {
                                                                                            updateInvoiceItem(item.id, 'productId', currentValue === item.productId ? "" : currentValue);
                                                                                            toggleProductOpen(item.id, false);
                                                                                        }}
                                                                                    >
                                                                                        <div className="flex flex-col">
                                                                                            <span>{product.productName}</span>
                                                                                            <span className="text-sm text-muted-foreground">${product.productPrice}</span>
                                                                                        </div>
                                                                                        <Check
                                                                                            className={cn(
                                                                                                "ml-auto h-4 w-4",
                                                                                                item.productId === product.productId.toString() ? "opacity-100" : "opacity-0"
                                                                                            )}
                                                                                        />
                                                                                    </CommandItem>
                                                                                ))}
                                                                            </CommandGroup>
                                                                        </CommandList>
                                                                    </Command>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </TableCell>
                                                        <TableCell className="w-1/3">
                                                            <div className="bg-muted/30 p-2 rounded text-sm text-muted-foreground min-h-[2.5rem] flex items-center">
                                                                {selectedProduct ? selectedProduct.productDescription : "Select a product to see description"}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="w-20 text-center">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity || ''}
                                                                onChange={(e) => updateInvoiceItem(item.id, 'quantity', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                                                                className="w-16 h-10 px-2 text-center text-sm border border-input bg-muted/30 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                                                                placeholder="Qty"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="w-24 text-right">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={item.rate || ''}
                                                                onChange={(e) => updateInvoiceItem(item.id, 'rate', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                                                                className="w-20 h-10 px-2 text-right text-sm border border-input bg-muted/30 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                                                                placeholder="0.00"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="w-24 text-right">
                                                            <span className="font-semibold">${item.amount.toFixed(2)}</span>
                                                        </TableCell>
                                                        <TableCell className="w-20 text-center">
                                                            {invoiceItems.length > 1 && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    type="button"
                                                                    onClick={() => removeInvoiceItem(item.id)}
                                                                    className="text-red-600 hover:text-red-800 h-8 px-2 text-xs"
                                                                >
                                                                    Remove
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                                
                                <div className="mt-4">
                                    <Button variant="outline" type="button" onClick={addInvoiceItem}>
                                        Add Item
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="invoice-section">
                                <div className="invoice-total">
                                    <div className="invoice-total-row">
                                        <span className="invoice-total-label">Subtotal:</span>
                                        <span className="invoice-total-value">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="invoice-total-row">
                                        <span className="invoice-total-label">Tax (10%):</span>
                                        <span className="invoice-total-value">${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="invoice-total-row invoice-total-final">
                                        <span className="invoice-total-label">Total:</span>
                                        <span className="invoice-total-value">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 justify-end mt-8">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => navigate('/invoice')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Update Invoice
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </main>
        </div>
    )
} 