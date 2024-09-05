'use server'

import { revalidatePath } from 'next/cache'

export type Item = {
    id: string
    name: string
    quantity: number
}

const items: Item[] = [
    { id: '1', name: 'Milk', quantity: 1 },
    { id: '2', name: 'Bread', quantity: 2 },
    { id: '3', name: 'Eggs', quantity: 12 },
]

export async function getItems(): Promise<Item[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return items
}

export async function addItem(newItem: Item): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 500))

    if (!newItem.name) {
        return { success: false, error: 'Item name is required' }
    }

    if (newItem.quantity <= 0) {
        return { success: false, error: 'Quantity must be greater than 0' }
    }

    items.push(newItem)
    revalidatePath('/shopping-list')
    return { success: true }
}

export async function removeItem(id: string): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const index = items.findIndex(item => item.id === id)
    if (index === -1) {
        return { success: false, error: 'Item not found' }
    }

    items.splice(index, 1)
    revalidatePath('/shopping-list')
    return { success: true }
}

export async function editItem(updatedItem: Item): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 500))

    if (!updatedItem.name) {
        return { success: false, error: 'Item name is required' }
    }

    if (updatedItem.quantity <= 0) {
        return { success: false, error: 'Quantity must be greater than 0' }
    }

    const index = items.findIndex(item => item.id === updatedItem.id)
    if (index === -1) {
        return { success: false, error: 'Item not found' }
    }

    items[index] = updatedItem
    revalidatePath('/shopping-list')
    return { success: true }
}