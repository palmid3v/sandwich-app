export default function Category({ title, items, selected, setSelected, toggle, color, isSize }) {
  return (
    <div style={{ background: "#0f172a", padding: 15, borderRadius: 12 }}>
      <h3>{title}</h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
        {items.map((item, i) => {
          const isSelected = isSize
            ? selected === item
            : selected.some(s => s.name === item.name);

          return (
            <button
              key={isSize ? item : item.name}
              onClick={() =>
                isSize
                  ? setSelected(item)
                  : toggle(item, selected, setSelected)
              }
              style={{
                padding: 12,
                borderRadius: 10,
                border: "none",
                background: isSelected ? color || "#22c55e" : "#1e293b",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {isSize ? `${item} cm` : item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}