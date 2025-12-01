"use client";
import React from "react";
import { MenuItem } from "@/features/menu/mockMenu";
import { useCartStore } from "@repo/store";

type Props = {
  menu: MenuItem;
};

const MenuItemCard: React.FC<Props> = ({ menu }) => {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="flex gap-4 items-center p-4 border rounded shadow-sm">
      {menu.image && (
        <img src={menu.image} alt={menu.name} className="w-24 h-24 object-cover rounded" />
      )}
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{menu.name}</h3>
        <p className="text-sm text-muted-foreground">{menu.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm font-medium">{menu.price.toLocaleString()}₫</div>
          <button
            className="bg-primary text-white px-3 py-1 rounded"
            onClick={() =>
              addItem({
                id: menu.id,
                name: menu.name,
                price: menu.price,
                imageUrl: menu.image,
                restaurantId: menu.restaurantId ?? "rest-1",
                quantity: 1,
              })
            }
          >
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
