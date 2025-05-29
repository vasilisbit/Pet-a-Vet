"use client"

import type React from "react"

// Update the imports to include the customer service
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { Plus, MoreHorizontal, Edit, Trash } from "lucide-react"
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  sendWelcomeEmail,
  type Customer,
  type CustomerFormData as ServiceCustomerFormData,
} from "@/lib/services/customer-service"

interface CustomerFormData {
  name: { value: string; error: boolean }
  email: { value: string; error: boolean }
  phone: { value: string; error: boolean }
  address: { value: string; error: boolean }
  city: { value: string; error: boolean }
  state: { value: string; error: boolean }
  postalCode: { value: string; error: boolean }
}

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")
  const [formData, setFormData] = useState<CustomerFormData>({
    name: { value: "", error: false },
    email: { value: "", error: false },
    phone: { value: "", error: false },
    address: { value: "", error: false },
    city: { value: "", error: false },
    state: { value: "", error: false },
    postalCode: { value: "", error: false },
  })

  const router = useRouter()

  const validateForm = () => {
    let isValid = true
    setFormData((prevData) => ({
      name: { value: prevData.name.value, error: !prevData.name.value },
      email: { value: prevData.email.value, error: !prevData.email.value },
      phone: { value: prevData.phone.value, error: !prevData.phone.value },
      address: { value: prevData.address.value, error: !prevData.address.value },
      city: { value: prevData.city.value, error: !prevData.city.value },
      state: { value: prevData.state.value, error: !prevData.state.value },
      postalCode: { value: prevData.postalCode.value, error: !prevData.postalCode.value },
    }))

    if (
      !formData.name.value ||
      !formData.email.value ||
      !formData.phone.value ||
      !formData.address.value ||
      !formData.city.value ||
      !formData.state.value ||
      !formData.postalCode.value
    ) {
      isValid = false
    }

    return isValid
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof CustomerFormData,
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: { value: e.target.value, error: false },
    }))
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.email.toLowerCase().includes(query.toLowerCase()) ||
        customer.phone.toLowerCase().includes(query.toLowerCase()),
    )
    setFilteredCustomers(filtered)
  }

  // Update the handleAddCustomer function to use the service
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setFormSuccess("")

    if (!validateForm()) {
      setFormError("Please correct the errors in the form")
      return
    }

    setIsLoading(true)

    try {
      const customerData: ServiceCustomerFormData = {
        name: formData.name.value,
        email: formData.email.value,
        phone: formData.phone.value,
        address: formData.address.value,
        city: formData.city.value,
        state: formData.state.value,
        postalCode: formData.postalCode.value,
      }

      const newCustomer = await createCustomer(customerData)

      if (newCustomer) {
        // Send welcome email
        await sendWelcomeEmail(newCustomer.email)

        // Update the customer list
        setCustomers([...customers, newCustomer])
        setFilteredCustomers([...customers, newCustomer])

        // Reset form
        setFormData({
          name: { value: "", error: false },
          email: { value: "", error: false },
          phone: { value: "", error: false },
          address: { value: "", error: false },
          city: { value: "", error: false },
          state: { value: "", error: false },
          postalCode: { value: "", error: false },
        })

        setFormSuccess("Customer added successfully")
        setTimeout(() => {
          setIsAddCustomerOpen(false)
          setFormSuccess("")
        }, 2000)
      } else {
        setFormError("Failed to add customer. Please try again.")
      }
    } catch (error) {
      setFormError("Failed to add customer. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Update the handleEditCustomer function to use the service
  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setFormSuccess("")

    if (!validateForm()) {
      setFormError("Please correct the errors in the form")
      return
    }

    setIsLoading(true)

    try {
      const customerData: ServiceCustomerFormData = {
        name: formData.name.value,
        email: formData.email.value,
        phone: formData.phone.value,
        address: formData.address.value,
        city: formData.city.value,
        state: formData.state.value,
        postalCode: formData.postalCode.value,
      }

      const updatedCustomer = await updateCustomer(selectedCustomer.id, customerData)

      if (updatedCustomer) {
        const updatedCustomers = customers.map((customer) => {
          if (customer.id === selectedCustomer.id) {
            return updatedCustomer
          }
          return customer
        })

        setCustomers(updatedCustomers)
        setFilteredCustomers(updatedCustomers)

        setFormSuccess("Customer updated successfully")
        setTimeout(() => {
          setIsEditCustomerOpen(false)
          setFormSuccess("")
        }, 2000)
      } else {
        setFormError("Failed to update customer. Please try again.")
      }
    } catch (error) {
      setFormError("Failed to add customer. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Update the handleDeleteCustomer function to use the service
  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const success = await deleteCustomer(customerId)

      if (success) {
        const updatedCustomers = customers.filter((customer) => customer.id !== customerId)
        setCustomers(updatedCustomers)
        setFilteredCustomers(updatedCustomers)
      }
    } catch (error) {
      console.error("Failed to delete customer", error)
    }
  }

  // Add a useEffect to load customers on component mount
  useEffect(() => {
    const loadCustomers = async () => {
      const data = await getCustomers()
      setCustomers(data)
      setFilteredCustomers(data)
    }

    loadCustomers()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-col space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold mb-4">Customers</CardTitle>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-64">
              <Input
                type="search"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Customer</DialogTitle>
                  <DialogDescription>Add a new customer to the database.</DialogDescription>
                </DialogHeader>
                {formError && <Alert variant="destructive">{formError}</Alert>}
                {formSuccess && <Alert>{formSuccess}</Alert>}
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name.value}
                      onChange={(e) => handleInputChange(e, "name")}
                      className="col-span-3"
                    />
                    {formData.name.error && <p className="text-red-500 col-span-4 text-sm">Name is required</p>}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email.value}
                      onChange={(e) => handleInputChange(e, "email")}
                      className="col-span-3"
                    />
                    {formData.email.error && <p className="text-red-500 col-span-4 text-sm">Email is required</p>}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone.value}
                      onChange={(e) => handleInputChange(e, "phone")}
                      className="col-span-3"
                    />
                    {formData.phone.error && <p className="text-red-500 col-span-4 text-sm">Phone is required</p>}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      Address
                    </Label>
                    <Input
                      id="address"
                      value={formData.address.value}
                      onChange={(e) => handleInputChange(e, "address")}
                      className="col-span-3"
                    />
                    {formData.address.error && <p className="text-red-500 col-span-4 text-sm">Address is required</p>}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="city" className="text-right">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={formData.city.value}
                      onChange={(e) => handleInputChange(e, "city")}
                      className="col-span-3"
                    />
                    {formData.city.error && <p className="text-red-500 col-span-4 text-sm">City is required</p>}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="state" className="text-right">
                      State
                    </Label>
                    <Input
                      id="state"
                      value={formData.state.value}
                      onChange={(e) => handleInputChange(e, "state")}
                      className="col-span-3"
                    />
                    {formData.state.error && <p className="text-red-500 col-span-4 text-sm">State is required</p>}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="postalCode" className="text-right">
                      Postal Code
                    </Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode.value}
                      onChange={(e) => handleInputChange(e, "postalCode")}
                      className="col-span-3"
                    />
                    {formData.postalCode.error && (
                      <p className="text-red-500 col-span-4 text-sm">Postal Code is required</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setIsAddCustomerOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" onClick={handleAddCustomer} disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Customer"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setFormData({
                              name: { value: customer.name, error: false },
                              email: { value: customer.email, error: false },
                              phone: { value: customer.phone, error: false },
                              address: { value: customer.address, error: false },
                              city: { value: customer.city, error: false },
                              state: { value: customer.state, error: false },
                              postalCode: { value: customer.postalCode, error: false },
                            })
                            setIsEditCustomerOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteCustomer(customer.id)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Edit an existing customer in the database.</DialogDescription>
          </DialogHeader>
          {formError && <Alert variant="destructive">{formError}</Alert>}
          {formSuccess && <Alert>{formSuccess}</Alert>}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name.value}
                onChange={(e) => handleInputChange(e, "name")}
                className="col-span-3"
              />
              {formData.name.error && <p className="text-red-500 col-span-4 text-sm">Name is required</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email.value}
                onChange={(e) => handleInputChange(e, "email")}
                className="col-span-3"
              />
              {formData.email.error && <p className="text-red-500 col-span-4 text-sm">Email is required</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={formData.phone.value}
                onChange={(e) => handleInputChange(e, "phone")}
                className="col-span-3"
              />
              {formData.phone.error && <p className="text-red-500 col-span-4 text-sm">Phone is required</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={formData.address.value}
                onChange={(e) => handleInputChange(e, "address")}
                className="col-span-3"
              />
              {formData.address.error && <p className="text-red-500 col-span-4 text-sm">Address is required</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                City
              </Label>
              <Input
                id="city"
                value={formData.city.value}
                onChange={(e) => handleInputChange(e, "city")}
                className="col-span-3"
              />
              {formData.city.error && <p className="text-red-500 col-span-4 text-sm">City is required</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="state" className="text-right">
                State
              </Label>
              <Input
                id="state"
                value={formData.state.value}
                onChange={(e) => handleInputChange(e, "state")}
                className="col-span-3"
              />
              {formData.state.error && <p className="text-red-500 col-span-4 text-sm">State is required</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="postalCode" className="text-right">
                Postal Code
              </Label>
              <Input
                id="postalCode"
                value={formData.postalCode.value}
                onChange={(e) => handleInputChange(e, "postalCode")}
                className="col-span-3"
              />
              {formData.postalCode.error && <p className="text-red-500 col-span-4 text-sm">Postal Code is required</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditCustomerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleEditCustomer} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CustomersPage
