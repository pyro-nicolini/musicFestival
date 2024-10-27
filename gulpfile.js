// 4. Explicación de gulpfile.js
// El archivo gulpfile.js es donde defines las tareas que Gulp va a ejecutar. Vamos a ver cómo funciona en este caso:
import path from "path";
import fs from "fs";
import { glob } from "glob";
import { src, dest, watch, series } from "gulp"; // Importa funciones desde Gulp: 'src' para obtener archivos, 'dest' para escribir archivos, 'watch' para vigilar cambios, y 'series' para ejecutar tareas en serie.
import * as dartSass from "sass"; // Importa el compilador Dart Sass.
import gulpSass from "gulp-sass"; // Importa gulp-sass, un plugin para compilar Sass usando gulp.

const sass = gulpSass(dartSass); // Asocia Dart Sass con gulp-sass, para usar Dart Sass como el compilador Sass.

// Importar módulos: Esto importa las funciones de Gulp que necesitas para gestionar tus tareas (src, dest, watch, series) y también el compilador de Sass.

import terser from "gulp-terser";
import sharp from "sharp";

//tareas de javascript:
//Esta función mueve tu archivo JavaScript desde la carpeta src/js a build/js, esencialmente copiando el archivo sin realizar ninguna transformación.
export function js(done) {
  // Define una función exportable 'js' para gestionar archivos JavaScript.
  src("src/js/app.js")
    .pipe(terser()) // Usa 'src' para seleccionar el archivo 'app.js' en la carpeta 'src/js'.
    .pipe(dest("build/js")); // Usa 'pipe' para pasar el archivo al destino 'build/js', moviendo 'app.js' a esa carpeta.
  done(); // Llama a 'done' para indicar que la tarea ha finalizado.
}

export function css(done) {
  // Define una función exportable 'css' para compilar archivos SCSS a CSS.
  src("src/scss/app.scss", { sourcemaps: true }) // Selecciona el archivo SCSS 'app.scss' y activa los sourcemaps para depuración.
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError)) // Compila el archivo SCSS a CSS y maneja errores con 'sass.logError'.
    .pipe(dest("build/css", { sourcemaps: "." })); // Guarda el archivo CSS compilado en 'build/css', junto con los sourcemaps.
  done(); // Llama a 'done' para finalizar la tarea.
}
//Esta tarea toma los archivos .scss, los compila a CSS, y guarda el archivo compilado en build/css. Los sourcemaps te permiten depurar fácilmente el código desde el navegador, mapeando el archivo CSS compilado al archivo SCSS original.

//NOLE JS codigo
export async function crop(done) {
  const inputFolder = "src/img/gallery/full";
  const outputFolder = "src/img/gallery/thumb";
  const width = 250;
  const height = 180;
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }
  const images = fs.readdirSync(inputFolder).filter((file) => {
    return /\.(jpg)$/i.test(path.extname(file));
  });
  try {
    images.forEach((file) => {
      const inputFile = path.join(inputFolder, file);
      const outputFile = path.join(outputFolder, file);
      sharp(inputFile)
        .resize(width, height, {
          position: "centre",
        })
        .toFile(outputFile);
    });

    done();
  } catch (error) {
    console.log(error);
  }
}

export async function imagenes(done) {
  const srcDir = "./src/img";
  const buildDir = "./build/img";
  const images = await glob("./src/img/**/*{jpg,png}");

  images.forEach((file) => {
    const relativePath = path.relative(srcDir, path.dirname(file));
    const outputSubDir = path.join(buildDir, relativePath);
    procesarImagenes(file, outputSubDir);
  });
  done();
}

function procesarImagenes(file, outputSubDir) {
  if (!fs.existsSync(outputSubDir)) {
    fs.mkdirSync(outputSubDir, { recursive: true });
  }
  const baseName = path.basename(file, path.extname(file));
  const extName = path.extname(file);
  const outputFile = path.join(outputSubDir, `${baseName}${extName}`);
  const outputFileWebp = path.join(outputSubDir, `${baseName}.webp`);
  const outputFileAvif = path.join(outputSubDir, `${baseName}.avif`);

  const options = { quality: 80 };
  sharp(file).jpeg(options).toFile(outputFile);
  sharp(file).webp(options).toFile(outputFileWebp);
  sharp(file).avif(options).toFile(outputFileAvif);
}

//tarea para observar los cambios
export function dev() {
  // Define la función exportable 'dev' para observar cambios en los archivos SCSS y JS.
  watch("src/scss/**/*.scss", css); // Vigila todos los archivos SCSS en la carpeta 'src/scss' y subcarpetas; al cambiar, ejecuta la tarea 'css'.
  watch("src/js/**/*.js", js); // Vigila todos los archivos JS en la carpeta 'src/js' y subcarpetas; al cambiar, ejecuta la tarea 'js'.
  watch("src/img/**/*.{png,jpg}", imagenes);
}

//orden de ejecucion
export default series(crop, js, css, imagenes, dev); // Esta tarea ejecuta las tareas 'js' y 'css' en serie y luego ejecuta la tarea 'dev' para vigilar los cambios en los archivos SCSS y JS.

/** EXPLICACION DE package.json
 * {
  "name": "festivalmusica",   // El nombre del proyecto, en este caso, es "festivalmusica".
  "version": "1.0.0",   // La versión actual del proyecto, empezando en 1.0.0.
  "description": "Aprendiendo SASS y NPM",   // Breve descripción del proyecto, que indica que se está aprendiendo SASS y NPM.
  "type": "module",   // Especifica que este proyecto utiliza módulos ES (ECMAScript).
  "main": "index.js",   // El archivo principal del proyecto, usado como punto de entrada, es 'index.js'.
  "scripts": {   // Define los scripts que pueden ejecutarse desde la terminal usando NPM.
    "sass": "sass --watch src/scss:build/css",   // Script 'sass' que observa los archivos SCSS en 'src/scss' y los compila en 'build/css' al cambiar.
    "dev": "gulp"   // Script 'dev' que ejecuta Gulp para correr las tareas automatizadas definidas en 'gulpfile.js'.
  },
  "keywords": [   // Palabras clave asociadas con el proyecto, útiles para búsquedas.
    "SASS",   // Indica que el proyecto usa Sass.
    "NPM",    // Indica que se gestiona con NPM.
    "GULP"    // Indica que Gulp es parte del proceso de automatización.
  ],
  "author": "PYRO_DEV",   // El nombre del autor del proyecto, en este caso "PYRO_DEV".
  "license": "ISC",   // El tipo de licencia del proyecto, ISC es una licencia de software abierta.
  "devDependencies": {   // Dependencias de desarrollo, necesarias solo durante el desarrollo.
    "gulp": "^5.0.0",   // Gulp, herramienta de automatización de tareas, versión 5.0.0 o superior.
    "sass": "^1.78.0"   // Dart Sass, compilador de SCSS a CSS, versión 1.78.0 o superior.
  },
  "dependencies": {   // Dependencias requeridas en producción.
    "gulp-sass": "^5.1.0"   // Gulp-sass, plugin para compilar SCSS a CSS usando Gulp, versión 5.1.0 o superior.
  }
}

5. DevDependencies vs Dependencies
devDependencies: Son herramientas que solo necesitas durante el desarrollo (como Gulp y Sass). No son necesarias para el código final en producción.
dependencies: Son herramientas o librerías que tu proyecto necesita para funcionar en producción.

 */
