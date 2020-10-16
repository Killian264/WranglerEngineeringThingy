
// Router from documentation
import Router from "./router"

import { githubSVG, linkedinSVG, htmlSVG } from "./resources.js"

const userLinks = [
	{ "name": "My Website", "url": "https://killiandebacker.com/" },
	{ "name": "Linkedin", "url": "https://www.linkedin.com/in/killian-debacker-95a813165/" },
	{ "name": "GitHub", "url": "https://github.com/Killian264" },
]

const socialLinks = [
	{ "url": "https://killiandebacker.com/", svg: htmlSVG },
	{ "url": "https://www.linkedin.com/in/killian-debacker-95a813165/", svg: linkedinSVG },
	{ "url": "https://github.com/Killian264", svg: githubSVG },
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
		.on("div#social", new SocialLinkTransformer(socialLinks))
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
				element.setInnerContent("Killian Debacker")
			}
		})
		.on("title", {
			element(element){
				element.setInnerContent("Killian Debacker")
			}
		})
		.on("body", {
			element(element){
				const classAttribute = element.getAttribute("class")
				const updatedAttribute = classAttribute.replace("bg-gray-900", "") + ' bg-blue-500'
				element.setAttribute("class", updatedAttribute)
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
		const linkHtml = this.links.map(link => {
			return `<a target="_blank" href="${link.url}">${link.name}</a>`
		})
		element.setInnerContent(linkHtml, {html: true});
	}
}

// Transform social links
class SocialLinkTransformer {
	constructor(links) {
	  this.links = links
	}
	
	async element(element) {
		element.removeAttribute("style")

		const linkHtml = this.links.map(link => {
			return `<a target="_blank" href="${link.url}">${link.svg}</a>`
		})
		
		element.setInnerContent(linkHtml, {html: true});
	}
}
