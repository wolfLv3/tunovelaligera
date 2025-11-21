// La documentación oficial requiere que 'cheerio' sea inyectado así:
const cheerio = require("cheerio"); 

// El resto de tu código ya es compatible con la estructura que definimos.

const sourceId = 99001;
const sourceName = "TuNovelaLigera";
const baseUrl = "https://tunovelaligera.com";

// 1. OBTENER NOVELAS POPULARES
const popularNovels = async (page) => {
  const url = `${baseUrl}/novelas/page/${page}/`;
  const result = await fetch(url);
  const body = await result.text();
  const $ = cheerio.load(body); // Volvemos a usar cheerio.load

  const novels = [];

  $("article.post").each(function () {
    const novelName = $(this).find("h2.entry-title a").text().trim();
    const novelUrl = $(this).find("h2.entry-title a").attr("href");
    const novelCover = $(this).find("img").attr("src");

    if (novelName && novelUrl) {
      novels.push({
        sourceId,
        novelName,
        novelCover,
        novelUrl,
      });
    }
  });
  return novels;
};

// ... (Resto de las funciones parseNovelAndChapters, parseChapter, searchNovels son iguales, 
// solo asegúrate de que usan const $ = cheerio.load(body); ) ...

// 2. OBTENER DETALLES
const parseNovelAndChapters = async (novelUrl) => {
  const result = await fetch(novelUrl);
  const body = await result.text();
  const $ = cheerio.load(body);

  const novel = {
    sourceId,
    sourceName,
    url: novelUrl,
    novelUrl,
    name: $("h1.entry-title").text().trim(),
    cover: $(".featured-image img").attr("src"),
    author: $(".author-name").text().trim() || "Desconocido",
    status: "OnGoing",
    genres: $(".cat-links a").map((i, el) => $(el).text()).get().join(", "),
    summary: $(".entry-content p").first().text().trim(),
    chapters: []
  };

  $(".entry-content a").each(function () {
    const link = $(this);
    const href = link.attr("href");
    const title = link.text().trim();

    if (href && href.includes(baseUrl) && title.toLowerCase().includes("capítulo")) {
      novel.chapters.push({
        novelUrl,
        chapterUrl: href,
        chapterName: title,
        releaseDate: null,
      });
    }
  });
  return novel;
};

// 3. OBTENER TEXTO CAPÍTULO
const parseChapter = async (novelUrl, chapterUrl) => {
  const result = await fetch(chapterUrl);
  const body = await result.text();
  const $ = cheerio.load(body);

  const contentElement = $(".entry-content");
  contentElement.find(".nav-links, .sharedaddy, script, style, .wp-block-buttons").remove();
  contentElement.find("div:contains('tunovelaligera')").remove();
  const chapterText = contentElement.html();
  return chapterText;
};

// 4. BUSCADOR
const searchNovels = async (searchTerm) => {
  const url = `${baseUrl}/?s=${searchTerm}`;
  const result = await fetch(url);
  const body = await result.text();
  const $ = cheerio.load(body);
  
  const novels = [];
  $("article.post").each(function () {
      const novelName = $(this).find("h2.entry-title a").text().trim();
      const novelUrl = $(this).find("h2.entry-title a").attr("href");
      const novelCover = $(this).find("img").attr("src");
      
      if (novelName && novelUrl) {
        novels.push({ sourceId, novelName, novelCover, novelUrl });
      }
  });
  return novels;
};


const source = {
  sourceId,
  sourceName,
  baseUrl,
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

// La documentación confirma que se usa export default
export default source;