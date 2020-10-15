// Router from documentation
import Router from "./router"

const userLinks = [
	{ "name": "My Website", "url": "https://killiandebacker.com/" },
	{ "name": "Linkedin", "url": "https://www.linkedin.com/in/killian-debacker-95a813165/" },
	{ "name": "GitHub", "url": "https://github.com/Killian264" },
]

let htmlUrl = "https://static-links-page.signalnerve.workers.dev"


addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request))
})

// Handle requests
async function handleRequest(request) {
  
	const router = new Router()

	router.get("/links", request => linksRequest(request))

	router.get("[^]*", request => retrieveHtml(request))

	let response = await router.route(request)

	if (!response) {
	  response = new Response("Not found", { status: 404 })
	}

	return response;
}

// Retrieve and massage html
async function retrieveHtml(request){
	const html = await requestStaticHtml()

	const rewriter = new HTMLRewriter()

	// I think I prefer writing it inline rather than making a new class elsewhere, I do both here
	const response = rewriter
		.on("div#links", new LinksTransformer(userLinks))
		.on("div#profile", {
			element(element){
				element.removeAttribute("style")
			}
		})
		.on("img#avatar", {
			element(element){
				// GitHub Image
				element.setAttribute("src", "https://avatars0.githubusercontent.com/u/43973287?s=460&v=4")

			}
		})
		.on("h1#name", {
			element(element){
				element.setInnerContent("Killian Debacker");
			}
		})
		.transform(html)
	return response
}


// request html from signalnerve
async function requestStaticHtml() {
	const init = {
	  headers: {
		"content-type": "text/html;charset=UTF-8",
	  },
	}
	// error handling could be done here by checking content type
	const response = await fetch(htmlUrl, init)
	return response;
}


// /links route 
async function linksRequest(request){
	return new Response(JSON.stringify(userLinks), {
		headers: {
			"content-type": "application/json;charset=UTF-8"
		}
	})
}

// Transform links into html and add to element
class LinksTransformer {
	constructor(links) {
	  this.links = links
	}
	
	async element(element) {
		let linkHtml = this.links.map(link => {
			return `<a target="_blank" href="${link.url}">${link.name}</a>`
		})
		element.setInnerContent(linkHtml, {html: true});
	}
}
