"use client"

interface InventoryTableProps{
    inventory: Record<string, number>;
}

const InventoryTable = ({inventory}: InventoryTableProps) => {
    return(
        <>
        {JSON.stringify(inventory)}
        </>
    )
}


export default InventoryTable