'use client'

import { useState, useEffect } from 'react'
import { getItems, addItem, removeItem, editItem, Item } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

export default function Page() {
  const [items, setItems] = useState<Item[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState(1)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    setIsLoading(true)
    try {
      const fetchedItems = await getItems()
      setItems(fetchedItems)
    } catch (error) {
      toast.error('Failed to fetch items')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    const newItem: Item = { id: Date.now().toString(), name: newItemName, quantity: newItemQuantity }

    // Optimistically update the UI
    setItems(prevItems => [...prevItems, newItem])
    setNewItemName('')
    setNewItemQuantity(1)

    try {
      const result = await addItem(newItem)
      if (result.success) {
        toast.success('Item added successfully')
      } else {
        // Rollback if there's an error
        setItems(prevItems => prevItems.filter(item => item.id !== newItem.id))
        toast.error(result.error || 'Failed to add item')
      }
    } catch (error) {
      // Rollback if there's an error
      setItems(prevItems => prevItems.filter(item => item.id !== newItem.id))
      toast.error('Failed to add item')
    }
  }

  async function handleRemoveItem(id: string) {
    // Store the item before removing it
    const itemToRemove = items.find(item => item.id === id)

    // Optimistically update the UI
    setItems(prevItems => prevItems.filter(item => item.id !== id))

    try {
      const result = await removeItem(id)
      if (result.success) {
        toast.success('Item removed successfully')
      } else {
        // Rollback if there's an error
        if (itemToRemove) {
          setItems(prevItems => [...prevItems, itemToRemove])
        }
        toast.error(result.error || 'Failed to remove item')
      }
    } catch (error) {
      // Rollback if there's an error
      if (itemToRemove) {
        setItems(prevItems => [...prevItems, itemToRemove])
      }
      toast.error('Failed to remove item')
    }
  }

  async function handleEditItem(updatedItem: Item) {
    // Store the original item before updating
    const originalItem = items.find(item => item.id === updatedItem.id)

    // Optimistically update the UI
    setItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item))
    setEditingItem(null)

    try {
      const result = await editItem(updatedItem)
      if (result.success) {
        toast.success('Item updated successfully')
      } else {
        // Rollback if there's an error
        if (originalItem) {
          setItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? originalItem : item))
        }
        toast.error(result.error || 'Failed to update item')
      }
    } catch (error) {
      // Rollback if there's an error
      if (originalItem) {
        setItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? originalItem : item))
      }
      toast.error('Failed to update item')
    }
  }

  return (
      <div className="container mx-auto p-4 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Shopping List</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="space-y-4 mb-6">
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                    id="itemName"
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Enter item name"
                    required
                />
              </div>
              <div>
                <Label htmlFor="itemQuantity">Quantity</Label>
                <Input
                    id="itemQuantity"
                    type="number"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(parseInt(e.target.value))}
                    min="1"
                    required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </form>
            <ul className="space-y-4">
              {items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between bg-secondary p-3 rounded-md">
                    {editingItem?.id === item.id ? (
                        <div className="flex items-center space-x-2 w-full">
                          <Input
                              type="text"
                              value={editingItem.name}
                              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                              className="flex-grow"
                          />
                          <Input
                              type="number"
                              value={editingItem.quantity}
                              onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) })}
                              className="w-20"
                              min="1"
                          />
                          <Button onClick={() => handleEditItem(editingItem)} disabled={isLoading} size="icon">
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => setEditingItem(null)} variant="outline" size="icon">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                    ) : (
                        <>
                    <span>
                      {item.name} (x{item.quantity})
                    </span>
                          <div className="space-x-2">
                            <Button onClick={() => setEditingItem(item)} variant="outline" size="icon">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => handleRemoveItem(item.id)} variant="destructive" size="icon">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                    )}
                  </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">Total items: {items.length}</p>
          </CardFooter>
        </Card>
        <Toaster position="bottom-center" />
      </div>
  )
}