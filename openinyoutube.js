var youtubeLinks = document
	.querySelectorAll("button.youtube")
	.forEach(function(button) {
		button.addEventListener("click", function(e) {
			var videoId = e.currentTarget.dataset.youtube;

			var desktopFallback = "www.youtube.com/watch?v="+videoId,
				mobileFallback = "www.youtube.com/watch?v="+videoId,
				app = "vnd.youtube://www.youtube.com/watch?v="+videoId;

			if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
				window.location = app;
				window.setTimeout(function() {
					window.location = mobileFallback;
				}, 25);
			} else {
				window.location = desktopFallback;
			}

			function killPopup() {
				window.removeEventListener("pagehide", killPopup);
			}

			window.addEventListener("pagehide", killPopup);
		});
	});
