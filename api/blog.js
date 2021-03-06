//import documentToHtmlString as richTextToHTML "https://unpkg.com/@contentful/rich-text-html-renderer@13.4.0/dist/rich-text-html-renderer.es5.js"

var content = document.querySelector("body");
var dataURL =
	"https://cdn.contentful.com/spaces/blfw5f11e921/environments/master/entries?access_token=5Kg3FYTOA0My4ZXtgfI_E6shQHGAsEyQRYOdS5CeHvg&order=sys.createdAt&limit=1000";

main();

async function main() {
	//var richTextToHTML;
	/*var documentToHtmlString = await import("https://unpkg.com/@contentful/rich-text-html-renderer@13.4.0/dist/rich-text-html-renderer.es5.js")
  .then(module => {
        richTextToHTML = module.documentToHtmlString;
      });*/

	var data = {};

	await loadJSONAsync(dataURL)
		.then(json => {
			data = json;
		})
		.catch(reason => console.log(`JSON okunurken hata: ${reason.message}`));

	
  content.innerText = JSON.stringify(data);

}

async function loadJSONAsync(url) {
	let response = await fetch(url);
	let data = await response.json();
	return data;
}
