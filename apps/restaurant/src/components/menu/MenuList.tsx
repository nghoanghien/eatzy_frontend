"use client";
import React from "react";
import { menuData } from "@/features/menu/mockMenu";
import MenuItemCard from "./MenuItemCard";

const MenuList: React.FC = () => {
  const categories = Array.from(new Set(menuData.map((it) => it.category)));

  return (
    <section className="container mx-auto py-8">
      {categories.map((cat) => (
        <div key={cat} className="mb-6">
          <h2 className="text-2xl font-bold mb-3">{cat}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuData
              .filter((it) => it.category === cat)
              .map((menu) => (
                <MenuItemCard key={menu.id} menu={menu} />
              ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default MenuList;
