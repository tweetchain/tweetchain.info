if(!TWEETCHAIN_API)
	var TWEETCHAIN_API = 'https://api.tweetchain.info:8443';
$(document).ready(() => {
	// window.twttr = (function(d, s, id) {
	// 	var js, fjs = d.getElementsByTagName(s)[0],
	// 		t = window.twttr || {};
	// 	if (d.getElementById(id)) return t;
	// 	js = d.createElement(s);
	// 	js.id = id;
	// 	js.src = "https://platform.twitter.com/widgets.js";
	// 	fjs.parentNode.insertBefore(js, fjs);

	// 	t._e = [];
	// 	t.ready = function(f) {
	// 		t._e.push(f);
	// 	};

	// 	return t;
	// } (document, "script", "twitter-wjs"));

	// twttr.ready(function() {
		getLongestValidChain('legacy', $('#latestLegacyBlock'), false);
		getLongestValidChain('strict100', $('#latestStrict100Block'));
		getTopTenBalances($('#twitHodlers'));
	// });
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

function getLongestValidChain(protocol = 'legacy', domelement = $('#latestLegacyBlock'), skiptokens = true) {
	$('div#loader').show();
	jQuery.getJSON(TWEETCHAIN_API + '/getlatest', {
		protocol: protocol,
		count: 200,
		start: 0,
	}, function(data) {
		fillBlockDOM('Longest Valid Chain', data, domelement, true);

		// Set some 'extra' data
		if(!skiptokens && data && data.length) {
			var total_tokens = 0;

			// Hodler hall of fame
			const hodlers = data.reverse().reduce(function(accum, block, index) {
				if(!accum[block.Twitter_user_screen_name])
					accum[block.Twitter_user_screen_name] = 0;
				// Users are granted TWIT equal to the number of child blocks they produced
				accum[block.Twitter_user_screen_name] += data.length - index;
				total_tokens += data.length - index;
				return accum;
			}, {});

			// In circulation
			$('span#tokenCirculation').text(total_tokens);
		}
		$('div#loader').hide();
	});
}

function getTopTenBalances(protocol = 'legacy', domelement = $('#twitHodlers'), skiptokens = true) {
	$('div#loader').show();
	jQuery.getJSON(TWEETCHAIN_API + '/gettop10balances', {}, function(data) {
		let rows = [];
		for(let hodler of data.balances) {
			rows.push($('<tr />').append([
				$('<td />').append($('<a />', {
						href: 'https://twitter.com/' + hodler.Twitter_user_screen_name + '/',
						text: hodler.Twitter_user_screen_name,
						target: '_blank',
					})),
				$('<td />', { text: hodler.balance.match(/([0-9]{0,}\.?[0-9]{0,8})/)[1], }),
			]))
		}
		$('table#twitHodlers>tbody').html(rows);
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

function fillBlockDOM(title, blocks, domelement = $('#latestLegacyBlock'), no_scroll = false) {
	if(!blocks || !blocks.length) {
		var my_alert = getAlert('No data retrieved!');
		$('main').prepend(my_alert);
		setTimeout(function() { my_alert.alert('close'); }, 3000);
		return;
	}

	// domelement.empty();

	// // Create and place
	// twttr.widgets.createTweet(
	// 	blocks[0].id,
	// 	document.getElementById('latestLegacyBlock'),
	// 	{
	// 		theme: 'light'
	// 	}
	// );

	// Proceed to fill the table with the rest of the tweets
	var blocksDIV = $('div.chainData>table>tbody', domelement);
	blocksDIV.empty();
	for(var block of blocks) {
		var linktext = location.protocol + '//twitter.com/' + block.Twitter_user_screen_name + '/status/' + block.id;
		blocksDIV.append($('<tr />').append([
			$('<td />', { text: block.block_number, }),
			$('<td />', { text: block.Twitter_user_screen_name, }),
			$('<td />', { text: block.text, title: block.text,}),
			// $('<td />', { text: block.Twitter_created_at, }),
			$('<td />').append([
				$('<a />', {
					href: linktext,
					target: '_blank',
					text: linktext,
					title: linktext,
				}),
			]),
		]));
	}

	if(!no_scroll)
		$('body').scrollTop(domelement.offset().top);
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
