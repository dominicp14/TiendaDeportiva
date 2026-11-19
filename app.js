// ===== Datos: arreglo de objetos (productos) =====
const TIPO_CAMBIO = 500; // 1 dólar = 500 colones (valor de referencia)

const productos = [
  { id: 1, nombre: "Balón Fútbol #5",        categoria: "Fútbol",     precio: 18000, imagen: "img/balon-futbol.png" },
  { id: 2, nombre: "Tacos Césped Sintético", categoria: "Fútbol",     precio: 42000, imagen: "img/tacos.png" },
  { id: 3, nombre: "Balón Baloncesto",       categoria: "Baloncesto", precio: 22000, imagen: "img/balon-basket.png" },
  { id: 4, nombre: "Short Running DryFit",   categoria: "Running",    precio: 15000, imagen: "img/short.png" },
  { id: 5, nombre: "Guantes Gym (par)",      categoria: "Gym",        precio: 12000, imagen: "img/guantes.png" },
  { id: 6, nombre: "Botella Deportiva 750ml",categoria: "Running",    precio: 8000,  imagen: "img/botella.png" },
  { id: 7, nombre: "Malla Baloncesto",       categoria: "Baloncesto", precio: 6000,  imagen: "img/malla.png" },
  { id: 8, nombre: "Medias Compresión",      categoria: "Running",    precio: 9000,  imagen: "img/medias.png" }
];

// ===== Estado =====
let carrito = [];          // [{ id, cantidad }]
let moneda = "CRC";

// ===== Referencias al DOM =====
const $ = (id) => document.getElementById(id);
const contenedor = $("productos");
const buscador = $("buscador");
const selCategoria = $("selCategoria");
const selOrden = $("selOrden");
const rango = $("rangoPrecio");
const textoRango = $("textoRango");
const selMoneda = $("selMoneda");

// ===== Funciones =====

// Da formato al precio según la moneda elegida
function formatear(colones) {
  if (moneda === "USD") {
    return "$" + (colones / TIPO_CAMBIO).toFixed(2);
  }
  return "₡" + String(colones).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Llena el select de categorías sin repetir
function cargarCategorias() {
  const categorias = [...new Set(productos.map((p) => p.categoria))];
  categorias.forEach((c) => {
    const op = document.createElement("option");
    op.value = c;
    op.textContent = c;
    selCategoria.appendChild(op);
  });
}

// Aplica búsqueda, categoría, precio y orden
function filtrar() {
  const texto = buscador.value.toLowerCase().trim();
  const cat = selCategoria.value;
  const max = Number(rango.value);

  let lista = productos.filter((p) =>
    p.nombre.toLowerCase().includes(texto) &&
    (cat === "todas" || p.categoria === cat) &&
    p.precio <= max
  );

  if (selOrden.value === "asc") lista.sort((a, b) => a.precio - b.precio);
  if (selOrden.value === "desc") lista.sort((a, b) => b.precio - a.precio);
  if (selOrden.value === "nombre") lista.sort((a, b) => a.nombre.localeCompare(b.nombre));

  return lista;
}

// Dibuja las tarjetas de productos dinámicamente
function mostrarProductos() {
  const lista = filtrar();
  contenedor.innerHTML = "";

  if (lista.length === 0) {
    contenedor.innerHTML = '<p class="vacio">No se encontraron productos.</p>';
    return;
  }

  lista.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <div class="info">
        <h3>${p.nombre}</h3>
        <span class="cat">${p.categoria}</span>
        <span class="precio">${formatear(p.precio)}</span>
        <button class="btn" data-id="${p.id}">Añadir</button>
      </div>`;
    contenedor.appendChild(card);
  });
}

// Añade un producto al carrito
function agregar(id) {
  const existente = carrito.find((i) => i.id === id);
  if (existente) existente.cantidad++;
  else carrito.push({ id, cantidad: 1 });

  const prod = productos.find((p) => p.id === id);
  avisar(prod.nombre + " añadido al carrito");
  actualizarCarrito();
}

// Cambia la cantidad (+1 / -1) y elimina si llega a 0
function cambiarCantidad(id, delta) {
  const item = carrito.find((i) => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) carrito = carrito.filter((i) => i.id !== id);
  actualizarCarrito();
}

// Dibuja el carrito, el total y el contador
function actualizarCarrito() {
  const lista = $("listaCarrito");
  lista.innerHTML = "";
  let total = 0;
  let unidades = 0;

  if (carrito.length === 0) {
    lista.innerHTML = '<div class="msg">Tu carrito está vacío.</div>';
  }

  carrito.forEach((item) => {
    const p = productos.find((x) => x.id === item.id);
    total += p.precio * item.cantidad;
    unidades += item.cantidad;

    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div><b>${p.nombre}</b><br><small>${p.categoria}</small></div>
      <span>${formatear(p.precio * item.cantidad)}</span>
      <div class="cant">
        <button data-id="${p.id}" data-d="-1">−</button>
        <span>${item.cantidad}</span>
        <button data-id="${p.id}" data-d="1">+</button>
      </div>`;
    lista.appendChild(div);
  });

  $("total").textContent = "Total: " + formatear(total);
  $("contador").textContent = unidades;
}

// Mensaje corto al añadir
function avisar(mensaje) {
  const t = $("toast");
  t.textContent = mensaje;
  t.classList.add("visible");
  setTimeout(() => t.classList.remove("visible"), 1800);
}

function abrirCarrito(abrir) {
  $("panelCarrito").classList.toggle("abierto", abrir);
  $("fondo").classList.toggle("abierto", abrir);
}

// Actualiza el texto del slider de precio
function actualizarTextoRango() {
  textoRango.textContent = "Hasta: " + formatear(Number(rango.value));
}

// Modo oscuro / claro
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  try { localStorage.setItem("tema", tema); } catch (e) {}
}

// ===== Eventos =====
contenedor.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (btn) agregar(Number(btn.dataset.id));
});

$("listaCarrito").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (btn) cambiarCantidad(Number(btn.dataset.id), Number(btn.dataset.d));
});

[buscador, selCategoria, selOrden].forEach((el) => el.addEventListener("input", mostrarProductos));

rango.addEventListener("input", () => {
  actualizarTextoRango();
  mostrarProductos();
});

selMoneda.addEventListener("change", () => {
  moneda = selMoneda.value;
  actualizarTextoRango();
  mostrarProductos();
  actualizarCarrito();
});

$("btnTema").addEventListener("click", () => {
  const actual = document.documentElement.getAttribute("data-theme");
  aplicarTema(actual === "dark" ? "light" : "dark");
});

$("btnCarrito").addEventListener("click", () => abrirCarrito(true));
$("btnCerrar").addEventListener("click", () => abrirCarrito(false));
$("fondo").addEventListener("click", () => abrirCarrito(false));

$("btnVaciar").addEventListener("click", () => {
  carrito = [];
  actualizarCarrito();
});

// ===== Inicio =====
try {
  const guardado = localStorage.getItem("tema");
  if (guardado) aplicarTema(guardado);
} catch (e) {}

cargarCategorias();
actualizarTextoRango();
mostrarProductos();
actualizarCarrito();
