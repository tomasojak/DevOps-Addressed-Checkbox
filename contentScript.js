function observeComments() {
	const targetNode = document.body;
	const config = { childList: true, subtree: true };

	const callback = function (mutationsList, observer) {
		for (let mutation of mutationsList) {
		if (mutation.addedNodes.length) {
			addCheckboxesToComments();
		}
		}
	};

	const observer = new MutationObserver(callback);
	observer.observe(targetNode, config); // Waits for loading to finish
}

// Add checkboxes to each comment
async function addCheckboxesToComments() {

	const checkBoxClassName = ".addressed-input";

	const runtimeAPI = typeof browser !== 'undefined' ? browser.runtime : chrome.runtime;
	const storageAPI = typeof browser !== 'undefined' ? browser.storage.local : chrome.storage.local;

	const templatePath = runtimeAPI.getURL("checkboxTemplate.html");
	const templateResponse = await fetch(templatePath);
	const templateHTML = await templateResponse.text();

	// Structure of DOM:
	// <div class="bolt-timeline-row"> </div>
	// 		<div class="repos-comment-viewer"> ... </div>
	// 		<div class="repos-comment-viewer"> ... </div>
	// <div class="bolt-timeline-row"> ... </div>

	// Get every post on the timeline
	const timelineElements = document.querySelectorAll(".bolt-timeline-row"); 

	timelineElements.forEach((timelineElement) => {

		

		// We want to access the first comment of the post, don't care about replies
		const comment = timelineElement.querySelector(".repos-comment-viewer"); // Gets first (root) comment

		if (comment == null) return; // Not always a comment
		if (comment.querySelector(checkBoxClassName)) return; // Check if the checkbox already exists

		// Create a div for the checkbox:
		let container = document.createElement("div");
		container.innerHTML = templateHTML;
		const checkboxWrapper = container.firstElementChild;

		// Logic for the checkbox:
		const commentId = comment.id;

		// Get the input element
		const checkbox = checkboxWrapper.querySelector(checkBoxClassName);
		
		// Do something when pressed
		checkbox.addEventListener("change", (e) => {
			// Emplace commentID : bool state to storage
			storageAPI.set({ [commentId]: e.target.checked });
		});

		// Find the commentID in the storage and assign correct checked value
		storageAPI.get([commentId], (result) => {
			checkbox.checked = !!result[commentId]; // (force boolean)
		});

		//container.append(checkbox); // Make a child of wrapper

		comment.prepend(container);
	});
}

// Initialize
observeComments();