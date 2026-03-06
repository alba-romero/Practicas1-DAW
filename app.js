listaProveedores = JSON.parse(localStorage.getItem("proveedores")) || [];

let historialCompras =
  JSON.parse(localStorage.getItem("historialCompras")) || [];

let inventario = JSON.parse(localStorage.getItem("stock")) || [];

let ultimaMermaRegistrada = localStorage.getItem("ultimaMerma") || null;

const tituloPrincipal = document.getElementById("titulo-principal");

const pantalla = document.getElementById("pantalla");

let datosTest = {tipo: "", puntos: [], total: 0};

function verSeccion(seccion, filtro = null) {
  pantalla.innerHTML = "";

  if (seccion === "inicio") {
    let recomendacionApp =
      localStorage.getItem("ultimaMejora") || "Realizar análisis de software";

    let puntosSostenibilidad =
      localStorage.getItem("puntos_sostenibilidad") || "0";
    let nivelSostenibilidad =
      localStorage.getItem("nivel_sostenibilidad") || "Pendiente";

    let puntosApps = localStorage.getItem("puntos_apps") || "0";
    let nivelApps = localStorage.getItem("nivel_apps") || "Pendiente";
    let colorSost =
      puntosSostenibilidad > 20
        ? "#2ecc71"
        : puntosSostenibilidad > 10
          ? "#f1c40f"
          : "#e67e22";

    const inv = typeof inventario !== "undefined" ? inventario : [];

    const provs =
      typeof listaProveedores !== "undefined" ? listaProveedores : [];

    const merma = localStorage.getItem("ultimaMerma");

    let totalStock = inv.reduce(
      (total, item) => total + (item.cantidad || 0),
      0,
    );

    let materialesBajos = inv.filter((item) => item.cantidad < 5).length;

    let barrasHTML = inv
      .map((item) => {
        let porcentaje = Math.min(((item.cantidad || 0) / 50) * 100, 100);

        let colorBarra = item.cantidad < 5 ? "#ff4757" : "#2ecc71";

        return `

            <div class="fila-progreso" style="margin-bottom: 20px;">

                <div style="display: flex; justify-content: space-between; align-items: center;">

                    <span style="font-size: 0.95rem; font-weight: 600;">${item.nombre}</span>

                    <span style="color: var(--color-texto-suave)">${item.cantidad} unidades</span>

                </div>

                <div class="barra-fondo">

                    <div class="barra-relleno" style="width: ${porcentaje}%; background-color: ${colorBarra};"></div>

                </div>

            </div>

        `;
      })
      .join("");

    let textoMerma = merma ? `${merma}%` : "---";

    pantalla.innerHTML = `

        <div class="cabecera-inicio">
        <h2>Panel de Control</h2>
        <p>Resumen operativo de la tonelería</p>
    </div>

    <div class="contenedor-dashboard">
        <div class="card-dash color-1 clickable" onclick="verSeccion('proveedores')">
            <h3>${provs.length}</h3>
            <p>Proveedores</p>
            <span class="ver-mas">Gestionar proveedores</span>
        </div>

        <div class="card-dash color-2 clickable" onclick="verSeccion('gestion')">
            <h3>${totalStock}</h3>
            <p>Total Stock</p>
            <span class="ver-mas">Ver inventario completo</span>
        </div>

        <div class="card-dash color-3 clickable" onclick="verSeccion('gestion', 'bajos')">
            <h3>${materialesBajos}</h3>
            <p>Alertas</p>
            <span class="ver-mas">Revisar materiales bajos</span>
        </div>

        <div class="card-dash clickable" 
             onclick="document.getElementById('input-mermas-hidden').click()" 
             style="border-left: 5px solid #ff4757; background: rgba(255, 71, 87, 0.1);">
            <h3 style="color: #ff4757">${textoMerma}</h3>
            <p>Última Merma (Java)</p>
            <span class="ver-mas"><i class="fas fa-sync"></i> Actualizar</span>
            <input type="file" id="input-mermas-hidden" style="display:none" onchange="importarMermasJava(event)">
        </div>

        <div class="card-dash clickable" onclick="verSeccion('configuracion')" style="border-top: 5px solid ${colorSost};">
            <h3 style="color: ${colorSost}">${puntosSostenibilidad}/100</h3>
            <p>Test: <strong>${nivelSostenibilidad}</strong></p>
            <span class="ver-mas">Sostenibilidad Digital</span>
        </div>

        <div class="card-dash clickable" onclick="verSeccion('configuracion')" style="border-top: 5px solid #3498db;">
            <h3 style="color: #3498db">${puntosApps}/100</h3>
            <p>Test: <strong>${nivelApps}</strong></p>
            <span class="ver-mas">Auditoría de Software</span>
        </div>
    </div> <div class="seccion-visual" style="margin-top: 30px;">
        <h3>Niveles de Inventario</h3>
        <div class="contenedor-barras">
            ${barrasHTML || "<p>No hay materiales registrados.</p>"}
        </div>
    </div>
`;
  }

  if (seccion === "gestion") {
    tituloPrincipal.innerHTML = "Gestión de stock";

    pantalla.innerHTML = `

            <div class="herramientas" style="display: flex; gap: 20px; align-items: center; margin-bottom: 30px;">

                <input type="text" id="busqueda-stock"

                       placeholder="Buscar material o categoría..."

                       onkeyup="filtrarStock()"

                       onkeydown="if(event.key === 'Enter') event.preventDefault();"

                       style="margin-bottom: 0; flex: 1;">

               

                <button onclick="abrirModalStock()" class="btn-principal" style="white-space: nowrap;">

                    + Añadir material

                </button>

            </div>

            <div id="contenedor-stock" class="grid-stock"></div>

            <div id="modal-stock" class="modal" style="display:none;">

                <div class="modal-contenido">

                    <h3>Nuevo Material</h3>

                    <input type="text" id="nuevo-nombre-stock" placeholder="Nombre">

                    <input type="text" id="nueva-categoria-stock" placeholder="Categoría">

                    <input type="number" id="nueva-cantidad-stock" placeholder="Cantidad inicial">

                    <div class="modal-botones-stock">

                        <button onclick="guardarNuevoMaterial()" class="btn-modal btn-guardar">Guardar</button>

                        <button onclick="cerrarStock()" class="btn-modal btn-cerrar">Cerrar</button>

                    </div>

                </div>

            </div>

        `;

    if (filtro === "bajos") {
      const inventarioBajo = inventario.filter((item) => item.cantidad < 5);

      pintarStock(inventarioBajo);

      tituloPrincipal.innerHTML = "Gestión de stock (Alertas de reposición)";
    } else {
      pintarStock();
    }
  }

  if (seccion === "proveedores") {
    tituloPrincipal.innerHTML = "Tablas de proveedores";

    pantalla.innerHTML = `

        <div class="buscador-seccion">

            <i class="fas fa-search" style="color: var(--color-texto-suave)"></i>

            <input type="text" id="input-busqueda" placeholder="Buscar por nombre o producto..." onkeyup="filtrarProveedores()">

            <button onclick="limpiarBusqueda()" class="boton-ajuste">Limpiar</button>

        </div>

        <table>

            <thead>

                <tr>

                    <th>Proveedor</th>

                    <th>Producto</th>

                    <th>Precio</th>

                    <th>Fecha</th>

                    <th>Acciones</th>

                </tr>

            </thead>

            <tbody id="cuerpo-tabla"></tbody>

        </table>

        <div class="formulario-proveedor">

            <h4><i class="fas fa-plus-circle"></i> Registrar nuevo proveedor</h4>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">

                <div>

                    <label>Nombre:</label>

                    <input type="text" id="nombreprov" placeholder="Nombre del proveedor">

                </div>

                <div>

                    <label>Producto:</label>

                    <input type="text" id="productoprov" placeholder="Nombre del producto">

                </div>

                <div>

                    <label>Precio (€):</label>

                    <input type="number" id="precioprov" placeholder="0.00">

                </div>

                <div>

                    <label>Alta del proveedor:</label>

                    <input type="date" id="fechaprov">

                </div>

            </div>

            <button id="btn-enviar" class="boton-principal" style="margin-top: 20px; width: 100%; justify-content: center;">

                Guardar Proveedor

            </button>

        </div>

    `;

    let botonprov = document.getElementById("btn-enviar");

    botonprov.addEventListener("click", formularioProv);

    pintarTabla();
  }

  if (seccion === "compras") {
    tituloPrincipal.innerHTML = "Registro de compras";

    let opcionesProveedores = listaProveedores
      .map(
        (p) =>
          `<option value="${p.nombre}">${p.nombre} (${p.producto})</option>`,
      )
      .join("");

    pantalla.innerHTML = `

        <div class="formulario-proveedor"> <h3><i class="fas fa-shopping-cart"></i>Nueva adquisición</h3>

            <div style="display: grid; grid-template-columns: 2fr 1fr gap: 15px; align-items: end;">

            <div>

            <label>Seleccionar proveedor:</label>

                <select id="compra-proveedor" style="width:100%; padding:10px; border-radius:5px;">

            ${
              opcionesProveedores.trim() !== ""
                ? opcionesProveedores
                : '<option value="">No hay proveedores registrados</option>'
            } 
            </select>

            </div>

            <div>

            <label>Cantidad:</label>

            <input type="number" id="compra-cantidad" placeholder="0">

            </div>

            </div>

            <button onclick="procesarCompra()" class="boton-principal" style="margin-top: 20px; width: 100%; justify-content: center;">Registrar compra</button>

        </div>

        <div id="historial-seccion" style="margin-top: 40px;">

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">

                <h3 style="margin: 0;">Historial reciente</h4>

                <button onclick="borrarHistorial()" class="boton-peligro">Borrar historial</button>

            </div>

            <div id="historial-compras">

                </div>

        </div>

    `;

    pintarHistorial();
  }

  if (seccion === "configuracion") {
    tituloPrincipal.innerHTML = "Configuración";

    pantalla.innerHTML = `
   <button onclick="abrirModalTest('sostenibilidad')" class="boton-principal" style="background-color: #2ecc71;">
   <i class="fas fa-chart-line"></i>Iniciar Test de Sostenibilidad
   </button>
   <button onclick="abrirModalTest('apps')" class="boton-principal" style="background-color: #3498db;">
   <i class= "fas fa-search-plus"></i> Analizar software
   </button>  

   <section class="seccion-ajuste">

   <h3><i class="fas fa-database"></i> Gestión de datos</h3>

   <p>Copia de seguridad y restauración del sistema.</p>

   <div class="botones-ajustes">

   <button onclick="exportarCopiaSeguridad()" class="boton-ajuste">Descargar copia (.json)</button>

   <label class="boton-ajuste" style="cursor:pointer;">

   Cargar copia (Importar)

   <input type="file" id="input-importar" style="display:none;" onchange="importarDatos(event)">

   </label>

   <button onclick="reiniciarSistema()" class="boton-peligro">Borrar todo</button>

   </div>

   </section>

   <section class="seccion-ajuste">

   <h3><i class="fas fa-paint-brush"></i> Apariencia</h3>

   <p>Personaliza cómo se ve tu panel de gestión.</p>

   <div class="botones-ajustes">

   <button onclick="cambiarModoOscuro()" class="boton-principal">Cambiar Modo Claro/Oscuro</button>

   </div>

   </section>

   <section class="seccion-ajuste">

   <h3><i class="fas fa-building"></i> Datos de la empresa</h3>

   <input type="text" id="nombre-empresa-config" placeholder="Nombre de la tonelería">

   <button onclick="guardarConfiguracion()" class="boton-principal" style="margin-top:10px;">Guardar nombre</button>

   </section>

   </div>

   <label class="boton-ajuste">

   <i class="fas fa-file-import"></i>Sincronizar mermas de taller (Java)

   <input type="file" id="input-mermas" style="display:none;" onchange="importarMermasJava(event)">

   </label>

   <div id="lista-mermas-taller"></div>

   `;
  }

  function formularioProv() {
    let nombreprov = document.getElementById("nombreprov").value;

    let productoprov = document.getElementById("productoprov").value;

    let precioprov = document.getElementById("precioprov").value;

    let fechaprov = document.getElementById("fechaprov").value;

    if (
      document.getElementById("nombreprov").value == "" ||
      document.getElementById("productoprov").value == ""
    ) {
      alert("No se han introducido datos.");
    } else {
      let tablaprov = document.getElementById("cuerpo-tabla");

      tablaprov.innerHTML += `
                <tr>

                <td>${nombreprov}</td>

                <td>${productoprov}</td>

                <td>${precioprov}</td>

                <td>${fechaprov}</td>

                <td> <button class="btn-borrar" onclick="this.parentElement.parentElement.remove()">Eliminar</button>

                </tr>
            `;

      let nuevoprov = {
        nombre: nombreprov,
        producto: productoprov,
        precio: precioprov,
        fecha: fechaprov,
      };

      listaProveedores.push(nuevoprov);

      localStorage.setItem("proveedores", JSON.stringify(listaProveedores));

      pintarTabla();

      document.getElementById("nombreprov").value = "";

      document.getElementById("productoprov").value = "";
    }
  }

  window.borrarProveedor = function (index) {
    listaProveedores.splice(index, 1);

    localStorage.setItem("proveedores", JSON.stringify(listaProveedores));

    pintarTabla();
  };
}

function pintarTabla(datos = listaProveedores) {
  let tabla = document.getElementById("cuerpo-tabla");

  if (!tabla) return;

  tabla.innerHTML = "";

  datos.forEach((item) => {
    let indexOriginal = listaProveedores.indexOf(item);

    tabla.innerHTML += `

        <tr>

            <td>${item.nombre}</td>

            <td>${item.producto}</td>

            <td>${item.precio}</td>

            <td>${item.fecha}</td>

            <td><button onclick="borrarProveedor(${indexOriginal})">Eliminar</button></td>

        </tr>`;
  });
}

//GESTIÓN DE STOCK

function pintarStock() {
  let contenedor = document.getElementById("contenedor-stock");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  inventario.forEach((item, index) => {
    let claseAlerta = item.cantidad < 5 ? "bajo-stock" : "";

    contenedor.innerHTML += `

            <div class="tarjeta-stock ${claseAlerta}">

            <span class="etiqueta-categoria">${item.categoria}</span>

            <h3 class="nombre-material">${item.nombre} </h3>

            <div class="info-cantidad">

            <p>Disponible</p>

            <span class="numero-stock">${item.cantidad}</span>

            </div>

            <div class="controles-stock">

            <button class="btn-control" onclick="ajustarStock(${index}, -1)">-</button>

            <button class="btn-control" onclick="ajustarStock(${index}, 1)">+</button>

            </div>

            </div>

            `;
  });
}

function ajustarStock(index, cambio) {
  inventario[index].cantidad += cambio;

  if (inventario[index].cantidad < 0) {
    inventario[index].cantidad = 0;
  }

  localStorage.setItem("stock", JSON.stringify(inventario));

  pintarStock();
}

function abrirModalStock() {
  document.getElementById("modal-stock").style.display = "flex";
}

function cerrarStock() {
  document.getElementById("modal-stock").style.display = "none";
}

function guardarNuevoMaterial() {
  let nom = document.getElementById("nuevo-nombre-stock").value;

  let cat = document.getElementById("nueva-categoria-stock").value;

  let cant = parseInt(document.getElementById("nueva-cantidad-stock").value);

  if (nom && cat && !isNaN(cant)) {
    inventario.push({ nombre: nom, categoria: cat, cantidad: cant });

    pintarStock();

    cerrarStock();
  } else {
    alert("Por favor, rellene los campos correctamente.");
  }
}

// BUSCADOR PROVEEDORES

function filtrarProveedores() {
  let input = document.getElementById("input-busqueda");

  let tabla = document.getElementById("cuerpo-tabla");

  if (!input || !tabla) return;

  let termino = input.value.toLowerCase();

  let proveedoresFiltrados = listaProveedores.filter((p) => {
    let nombre = p.nombre ? String(p.nombre).toLowerCase() : "";

    let producto = p.producto ? String(p.producto).toLowerCase() : "";

    return nombre.includes(termino) || producto.includes(termino);
  });

  if (proveedoresFiltrados.length === 0 && termino !== "") {
    tabla.innerHTML = `

    <tr><td colspan="5" style="text-align:center;

    color:red;">

    No se han encontrado proveedores que coincidan con "${termino}"

    </td></tr>`;
  } else {
    pintarTabla(proveedoresFiltrados);
  }
}

function limpiarBusqueda() {
  let input = document.getElementById("input-busqueda");

  if (input) {
    input.value = "";

    pintarTabla();
  }
}

// COMPRAS

function procesarCompra() {
  let nombreProveedor = document.getElementById("compra-proveedor").value;

  let cantidadCompra = parseInt(
    document.getElementById("compra-cantidad").value,
  );

  if (!nombreProveedor || isNaN(cantidadCompra) || cantidadCompra <= 0) {
    alert("Por favor, selecciona un proveedor y una cantidad válida.");

    return;
  }

  let proveedor = listaProveedores.find((p) => p.nombre === nombreProveedor);

  if (proveedor) {
    let itemStock = inventario.find(
      (item) => item.nombre.toLowerCase() === proveedor.producto.toLowerCase(),
    );

    if (itemStock) {
      itemStock.cantidad += cantidadCompra;

      alert(
        `Compra procesada: Se han sumado ${cantidadCompra} unidades a ${itemStock.nombre}.`,
      );
    } else {
      inventario.push({
        nombre: proveedor.producto,

        cantidad: cantidadCompra,

        categoria: "General",
      });

      alert(`Nuevo producto añadido al stock: ${proveedor.producto}`);
    }

    localStorage.setItem("stock", JSON.stringify(inventario));

    registrarEnHistorial(proveedor, cantidadCompra);

    document.getElementById("compra-cantidad").value = "";
  }
}

//HISTORIAL DE COMPRAS

function registrarEnHistorial(proveedor, cantidad) {
  let precioUnitario = Number(proveedor.precio) || 0;

  let nuevaCompra = {
    fecha: new Date().toLocaleString(),

    proveedor: proveedor.nombre,

    producto: proveedor.producto,

    cantidad: cantidad,

    precioTotal: (precioUnitario * cantidad).toFixed(2),
  };

  historialCompras.unshift(nuevaCompra);

  localStorage.setItem("historialCompras", JSON.stringify(historialCompras));

  pintarHistorial();
}

function pintarHistorial() {
  let contenedor = document.getElementById("historial-compras");

  if (!contenedor) return;

  if (historialCompras.length === 0) {
    contenedor.innerHTML = `

       <p>No hay compras registradas aún.</p>

       `;

    return;
  }

  let tablaHTML = `

        <table>

        <thead>

        <tr>

        <th>Fecha</th>

        <th>Proveedor</th>

        <th>Producto</th>

        <th>Cant.</th>

        <th>Total</th>

        </tr>

        </thead>

        <tbody>

        `;

  historialCompras.forEach((c) => {
    tablaHTML += `

            <tr>

            <td>${c.fecha}</td>

            <td>${c.proveedor}</td>

            <td>${c.producto}</td>

            <td><span class="numero-stock" style="font-size:1em">${c.cantidad}</span></td>

            <td style="font-weight:bold; color:var(--color-primario)">${c.precioTotal}€</td>

            </tr>

            `;
  });

  tablaHTML += `</tbody></table>`;

  contenedor.innerHTML = tablaHTML;
}

function borrarHistorial() {
  if (confirm("Seguro que quieres borrar todo el historial de compras?")) {
    historialCompras = [];

    localStorage.removeItem("historialCompras");

    pintarHistorial();
  }
}

function exportarCopiaSeguridad() {
  const datosToneleria = {
    proveedores: listaProveedores,

    existencias: inventario,

    compras: historialCompras,

    fechaDeCopia: new Date().toISOString(),
  };

  const cadenaTexto = JSON.stringify(datosToneleria, null, 2);

  const archivoBlob = new Blob([cadenaTexto], { type: "application/json" });

  const urlDescarga = URL.createObjectURL(archivoBlob);

  const enlace = document.createElement("a");

  enlace.href = urlDescarga;

  enlace.download = `copia_seguridad_toneleria_json`;

  document.body.appendChild(enlace);

  enlace.click();

  document.body.removeChild(enlace);
}

function cambiarModoOscuro() {
  const cuerpo = document.documentElement;

  const temaActual = cuerpo.getAttribute("data-tema");

  if (temaActual === "oscuro") {
    cuerpo.setAttribute("data-tema", "claro");

    localStorage.setItem("temaPreferido", "claro");
  } else {
    cuerpo.setAttribute("data-tema", "oscuro");

    localStorage.setItem("temaPreferido", "oscuro");
  }
}

function guardarConfiguracion() {
  const nuevoNombre = document.getElementById("nombre-empresa-config").value;

  if (nuevoNombre) {
    localStorage.setItem("nombreEmpresa", nuevoNombre);

    tituloPrincipal.innerHTML = nuevoNombre;

    alert("Configuración guardada.");
  }
}

(function cargarConfiguracionInicial() {
  const temaGuardado = localStorage.getItem("temaPreferido");

  if (temaGuardado === "oscuro") {
    document.documentElement.setAttribute("data-tema", "oscuro");
  }

  const nombreGuardado = localStorage.getItem("nombreEmpresa");

  if (nombreGuardado) {
    setTimeout(() => {
      tituloPrincipal.innerText = nombreGuardado;
    }, 100);
  }
})();

function reiniciarSistema() {
  if (confirm("¿Estás seguro? Se borrarán todos los datos.")) {
    localStorage.clear();

    location.reload();
  }
}

function importarDatos(evento) {
  const archivo = evento.target.files[0];

  if (!archivo) return;

  const lector = new FileReader();

  lector.onload = function (e) {
    try {
      const contenido = JSON.parse(e.target.result);

      if (
        confirm(
          "¿Quieres cargar esta copia? Se borrarán los datos actuales del navegador",
        )
      ) {
        listaProveedores = contenido.proveedores || [];

        inventario = contenido.existencias || [];

        historialCompras = contenido.compras || [];

        localStorage.setItem("proveedores", JSON.stringify(listaProveedores));

        localStorage.setItem("stock", JSON.stringify(inventario));

        localStorage.setItem(
          "historialCompras",
          JSON.stringify(historialCompras),
        );

        alert("Datos restaurados con éxito");

        location.reload();
      }
    } catch (error) {
      alert("Error: el archivo no es válido");
    }
  };

  lector.readAsText(archivo);
}

window.onload = () => {
  verSeccion("inicio");
};

document.addEventListener("DOMContentLoaded", () => {
  const nombreGuardado = localStorage.getItem("nombreEmpresa");

  if (nombreGuardado && tituloPrincipal) {
    tituloPrincipal.innerText = nombreGuardado;
  }

  const temaGuardado = localStorage.getItem("temaPreferido");

  if (temaGuardado === "oscuro") {
    document.documentElement.setAttribute("data-tema", "oscuro");
  }

  verSeccion("inicio");
});

function importarMermasJava(evento) {
  const archivo = evento.target.files[0];

  if (!archivo) {
    console.error("No se ha seleccionado ningún archivo.");

    return;
  }

  const lector = new FileReader();

  lector.onload = function (e) {
    try {
      let contenido = e.target.result.trim();

      let contenidoReparado = contenido

        .replace(/}\s*{/g, "}, {")

        .replace(/,\s*$/, "");

      let jsonParaParsear = "[" + contenidoReparado + "]";

      const datosValidos = JSON.parse(jsonParaParsear);

      const ultima = datosValidos[datosValidos.length - 1];

      localStorage.setItem("ultimaMerma", ultima.resultado);

      alert(
        `Sincronizado. Se han cargado ${datosValidos.length} registros.\nÚltimo resultado: ${ultima.resultado}`,
      );

      verSeccion("inicio");
    } catch (err) {
      console.error("Fallo al parsear:", err);

      alert(
        "El archivo mermas.json tiene errores de escritura que no se han podido reparar.",
      );
    }
  };

  lector.readAsText(archivo);
}
function filtrarStock() {
  let input = document.getElementById("busqueda-stock");

  let termino = input.value.toLowerCase();

  let tarjetas = document.querySelectorAll(".tarjeta-stock");

  let contenedor = document.getElementById("contenedor-stock");

  let encontrados = 0;

  tarjetas.forEach((tarjeta) => {
    let nombre = tarjeta
      .querySelector(".nombre-material")
      .innerText.toLowerCase();

    let categoria = tarjeta
      .querySelector(".etiqueta-categoria")
      .innerText.toLowerCase();

    if (nombre.includes(termino) || categoria.includes(termino)) {
      tarjeta.style.display = "";

      encontrados++;
    } else {
      tarjeta.style.display = "none";
    }
  });

  let mensajeError = document.getElementById("sin-resultados-stock");

  if (encontrados === 0) {
    if (!mensajeError) {
      mensajeError = document.createElement("p");

      mensajeError.id = "sin-resultados-stock";

      mensajeError.style.color = "var(--color-peligro)";

      mensajeError.style.fontWeight = "bold";

      mensajeError.style.textAlign = "center";

      mensajeError.style.gridColumn = "1 / -1";

      mensajeError.innerHTML = `No se han encontrado materiales que coincidan con "${termino}`;

      contenedor.appendChild(mensajeError);
    } else {
      mensajeError.innerHTML = `No se han encontrado materiales que coincidan con "${termino}"`;
    }
  } else {
    if (mensajeError) {
      mensajeError.remove();
    }
  }
}

function abrirModalTest(tipo) {
  const esSostenibilidad = tipo === "sostenibilidad";
  const titulo = esSostenibilidad
    ? "Test de Sostenibilidad y Digitalización"
    : "Test de Aplicaciones";
  const colorCabecera = esSostenibilidad ? "#2ecc71" : "#3498db";

  const preguntasSostenibilidad = [
    "¿Documentos principales digitalizados?",
    "¿Uso de ERP/CRM centralizado?",
    "¿Conexión de datos entre departamentos?",
    "¿Presencia activa en canales digitales?",
    "¿Copias de seguridad automáticas?",
    "¿Monitorización de consumo energético?",
    "¿Plan de reciclaje de residuos?",
    "¿Proveedores sostenibles/proximidad?",
    "¿Formación tecnológica del personal?",
    "¿Medición de KPIs de eficiencia?",
  ];
  const preguntasApp = [
    "¿Acceso remoto/móvil disponible?",
    "¿Actualizaciones automáticas de seguridad?",
    "¿Interfaz intuitiva y fácil?",
    "¿Exportación de datos sencilla (JSON/PDF)?",
    "¿Sin duplicidad de datos manual?",
    "¿Rendimiento rápido y sin bloqueos?",
    "¿Gestión de permisos y usuarios?",
    "¿Conectividad entre apps?",
    "¿Relación coste/beneficio óptima?",
    "¿Escalabilidad para crecimiento?",
  ];
  const listaPreguntas = esSostenibilidad
    ? preguntasSostenibilidad
    : preguntasApp;

  const overlay = document.createElement("div");
  overlay.id = "modal-test-general";
  overlay.style =
    "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:2500; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(5px);";

  let preguntasHTML = listaPreguntas
    .map(
      (texto, i) => `
<div style="margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:8px;">
<label style="display:block; font-size:0.9rem; font-weight:bold; margin-bottom:5px;">${i + 1}. ${texto}</label>
<select id="resp${i}" style="width:100%; padding:6px; border-radius:4px; border:1px solid #ccc;">
<option value="0">No (0 pts)</option>
<option value="5">En proceso / A medias (5 pts)</option>
<option value="10">Sí / Totalmente (10 pts)</option>
</select>
</div>
`,
    )
    .join("");

  overlay.innerHTML = `
<div style="background:white; padding:30px; border-radius:15px; width:95%; max-width:550px; max-height:85vh; overflow-y:auto; position:relative; color:#333; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
<span onclick="this.parentElement.parentElement.remove()" style="position:absolute; top:15px; right:20px; cursor:pointer; font-size:28px; color:#999;">&times;</span>
<h2 style="color:${colorCabecera}; display:inline-block;">${titulo}</h2>
<p style="font-size:0.85rem; color:#666; margin-bottom:20px;">Completa las 10 cuestiones para el diagnóstico.</p>
<form id="formulario-test">${preguntasHTML}</form>
<button onclick="finalizarTest('${tipo}')" style="width:100%; padding:15px; background:${colorCabecera}; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1.1rem; margin-top:20px;">Obtener Informe de Mejora</button>
<div id="caja-resultado" style="margin-top:20px; padding:15px; border-radius:8px; display:none; text-align:left;"></div>
</div>
`;
  document.body.appendChild(overlay);
}

function calcularResultadoTest() {
  const q1 = parseInt(document.getElementById("q1").value);
  const q2 = parseInt(document.getElementById("q2").value);
  const q3 = parseInt(document.getElementById("q3").value);
  const total = q1 + q2 + q3;

  localStorage.setItem("puntuacionTest", total);

  const divRes = document.getElementById("res-test");
  divRes.style.display = "block";
  divRes.style.background = "rgba(46, 204, 113, 0.1)";

  let categoria =
    total <= 10
      ? "Analógico"
      : total <= 20
        ? "En Transformación"
        : "Empresa 4.0";
  localStorage.setItem("categoriaTest", categoria);

  divRes.innerHTML = `<h3 style="margin:0; color:#2ecc71;">Nivel: ${categoria}</h3>
                        <p>Resultado guardado en el Panel Principal.</p>
                        <button onclick="location.reload()" style="margin-top:10px; cursor:pointer;">Ver en Inicio</button>`;
}

function finalizarTest(tipo) {
  let listaRespuestas = [];
  let sumaPuntos = 0;
  for (let i = 0; i < 10; i++) {
    let valor = parseInt(document.getElementById(`resp${i}`).value) || 0;
    listaRespuestas.push(valor);
    sumaPuntos += valor;
  }

  datosTest = {
    tipo: tipo,
    puntos: listaRespuestas,
    total: sumaPuntos
  };

  const esSostenibilidad = tipo === "sostenibilidad";
  let categoria = "";
  let recomendacionApp = "";

  if (esSostenibilidad) {
    categoria =
      sumaPuntos < 40
        ? "Poco digitalizada y sostenible"
        : sumaPuntos < 80
          ? "En crecimiento digital y sostenible"
          : "Empresa Digitalizada y Sostenible";
    recomendacionApp =
      sumaPuntos < 60
        ? "Priorizar la digitalización de datos."
        : "Optimizar la conexión en la nube.";
    localStorage.setItem("puntos_sostenibilidad", sumaPuntos);
    localStorage.setItem("nivel_sostenibilidad", categoria);
  } else {
    categoria =
      sumaPuntos < 40
        ? "Infraestructura obsoleta"
        : sumaPuntos < 80
          ? "Software Funcional"
          : "Ecosistema Optimizado";
    recomendacionApp =
      sumaPuntos < 60
        ? "Sugerencia: Cambiar Excels por bases de datos integradas."
        : "Mantener protocolos de seguridad.";
    localStorage.setItem("puntos_apps", sumaPuntos);
    localStorage.setItem("nivel_apps", categoria);
  }
  const divRes = document.getElementById("caja-resultado");
  divRes.style.display = "block";
  divRes.style.display = "#f8f9fa";
  divRes.style.borderLeft = `5px solid ${esSostenibilidad ? "#2ecc71" : "#3498db"}`;
  divRes.innerHTML = `
    <h3 style="margin:0;">Resultado: ${sumaPuntos}/100</h3>
    <p><strong>Clasificación:</strong> ${categoria}</p>
    <p style="font-size:0.9rem; color:#444;"><strong>Plan de mejora:</strong> ${recomendacionApp}</p>
    <button onclick="location.reload()" style="width:100%; margin-top:10px; cursor:pointer; padding:8px;">Volver al panel principal</button>
    `;

    divRes.innerHTML += `
    <div style="margin-top: 15px; display: flex; gap: 10px;">
    <button onclick="exportarTestJSON('${tipo}')" class="boton-ajuste">Descargar JSON</button>
    <button onclick="exportarTestCSV('${tipo}')" class="boton-ajuste">Descargar CSV</button>
    </div>
    `;
}

function exportarTestJSON(tipoDeAuditoria) {
    const contenido = JSON.stringify(datosTest, null, 2);
    const blob = new Blob([contenido], {type: "application/json"});
    const url = URL.createObjectURL(blob);

    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `auditoria_${datosTest.tipo}.json`;
    enlace.click();
}

function exportarTestCSV(tipoDeAuditoria) {
    
    let contenidoCSV = "Pregunta,Puntuacion\n";
    datosTest.puntos.forEach((p, i) => {
        contenidoCSV += `Pregunta ${i + 1},${p}\n`;
    });
    contenidoCSV += `TOTAL,${datosTest.total}`;

    const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `informe_${datosTest.tipo}.csv`;
    enlace.click();

}