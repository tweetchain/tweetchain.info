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
		getLongestValidChain();
	});
});

function search(submitBTN) {
	var search = $('input', submitBTN.form).val();
	search = search.trim();

	if(!search || !search.length) {
		getLongestValidChain();
	} else {
		getChain(search);
	}

	return false;
}

function getLongestValidChain() {
	$('div#loader').show();
	jQuery.getJSON(TWEETCHAIN_API
			+ '/getlatest?count=200&start=0', {}, function(data) {
		fillBlockDOM('Longest Valid Chain', data);
		$('div#loader').hide();
	});
}

function getChain(block_id) {
	$('div#loader').show();
	jQuery.getJSON(TWEETCHAIN_API
			+ '/getblock?id='+block_id+'&count=200&start=0', {}, function(data) {
		fillBlockDOM('Chain Data', data);
		$('div#loader').hide();
	});
}

function fillBlockDOM(title, blocks) {
	if(!blocks || !blocks.length) {
		var my_alert = getAlert('No data retrieved!');
		$('main').prepend(my_alert);
		setTimeout(function() { my_alert.alert('close'); }, 3000);
		return;
	}

	$('#latestBlock').empty();

	// Create and place
	twttr.widgets.createTweet(
		blocks[0].id,
		document.getElementById('latestBlock'),
		{
			theme: 'light'
		}
	);

	$('h2#chainTitle').text(title);

	// Proceed to fill the table with the rest of the tweets
	var blocksDIV = $('div#chainData>table>tbody');
	blocksDIV.empty();
	for(var block of blocks) {
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

	$('body').scrollTop(0);
}

function getAlert(text) {
	return $('<div />', {
			class: 'alert alert-danger alert-dismissible fade show',
			role: 'alert',
			text: text,
		}).append($('<button />', {
				type: 'button',
				class: 'close',
				'data-dismiss': 'alert',
				'aria-label': 'Close',
			}).append($('<span />', {
					'aria-hidden': true,
					html: '&times;',
				})));
}
