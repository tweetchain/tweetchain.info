var TWEETCHAIN_API = "https://api.tweetchain.info:8443";
// var TWEETCHAIN_API = "https://localhost:8443";

$(document).ready(() => {
	window.twttr = (function(d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0],
			t = window.twttr || {};
		if (d.getElementById(id)) return t;
		js = d.createElement(s);
		js.id = id;
		js.src = "https://platform.twitter.com/widgets.js";
		fjs.parentNode.insertBefore(js, fjs);

		t._e = [];
		t.ready = function(f) {
			t._e.push(f);
		};

		return t;
	} (document, "script", "twitter-wjs"));

	twttr.ready(function() {
		jQuery.getJSON(TWEETCHAIN_API + '/getlatest?count=20&start=0', {}, function(data) {
				// Create and place
				twttr.widgets.createTweet(
					data[0].id,
					document.getElementById('latestBlock'),
					{
						theme: 'light'
					}
				);

				// Proceed to fill the table with the rest of the tweets
				var blocksDIV = $('div#longestValidChain>table>tbody');
				for(var block of data) {
					var linktext = location.protocol + '//twitter.com/' + block.Twitter_user_screen_name + '/status/' + block.id;
					blocksDIV.append($('<tr />').append([
						$('<td />', { text: block.block_number, }),
						$('<td />', { text: block.Twitter_user_screen_name, }),
						$('<td />', { text: block.text, }),
						$('<td />', { text: block.Twitter_created_at, }),
						$('<td />').append([
							$('<a />', {
								href: linktext,
								target: '_blank',
								text: linktext,
							}),
						]),
					]));
				}
			});
	});
});
