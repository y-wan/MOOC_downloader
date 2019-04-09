(function($) {
	window.location.host.match(/futurelearn\.com/) && (function() {
		function file_get_contents(url, callback) {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4 && xhr.status == 200) {
					var h = document.createElement("html");
					h.innerHTML = xhr.responseText;
					callback(h);
				}
			}
			xhr.open("GET", url, true);
			xhr.send(null);
		}
		file_get_contents(location.href, function(d) {
			document.querySelector(".related-files").innerHTML += [].map.call(d.querySelectorAll("video div[data-kind='subtitles']"), function(sub) {
				return '<li class="media media-small media-sectioned">'+
		          '<div class="media_centered_container">'+
		            '<div aria-hidden="true" class="media_icon icon" data-icon="x"></div>'+
		            '<div class="media_body">'+
		              '<div class="header header-double">'+
		                '<h5 class="headline headline-primary">'+
		                  '<a class="futerlearnDown" href="'+sub.getAttribute('data-src')+'">'+sub.getAttribute('data-label')+' Subtitle Download</a>'+
		                  '<span class="headline headline-secondary" style="margin-left:5px;">srt</span>'+
		                '</h5></div></div></div></li>';
			}).join('');
		})
	}());
	window.location.host == "class.coursera.org" && $('.course-item-list-section-list li').map(function(){return $('a:last', $(this)).get(0)}).each(function(i,item){
		var chinese = this.href.replace('download.mp4?lecture_id', 'subtitles?q');
		chinese += '_zh&format=srt';
		$.ajax({type:"HEAD", url:chinese, complete:function(xhr,data) {
			if(xhr.status != 200) {
				chinese = chinese.replace('_zh&', '_zh-cn&');
				$.ajax({type:"HEAD", url:chinese, complete:function(xhr,data) {
					if(xhr.status != 200) return false;
					$(item).before('<a target="_new" href="'+chinese+'" title="中文字幕下载">中</a>');
				}})
			} else $(item).before('<a target="_new" href="'+chinese+'" title="中文字幕下载">中</a>');
		}})
	})

	/** edX **/
	if(!$('li[data-index]')) return false;
	
	function parseTime(time) {
		var min = Math.floor(time / 60000);
		var hour = Math.floor(time / 3600000);
		var second = time / 1000 - hour * 3600 - min * 60;
		min = String(min).length < 2 ? '0'+min : String(min);
		hour = String(hour).length < 2 ? '0'+hour : String(hour);
		second = second.toFixed(3);
		second = String(second).length<6 ? '0'+second : String(second);
		second = second.split('.').join(',');
		return hour+':'+min+':'+second; 
	}

	if ($('#seq_content').find('.video').get(0) !== undefined) {		
		var video_btn = '<a href="#" id="Video_download" style="font-size:0.7em;">Video download\t</a>';
		$('section h2') && $('section h2').last().append(video_btn);
		var sub_btn = '<a href="#" id="Subtitle_download" style="font-size:0.7em;">Subtitle download</a>';
		$('section h2') && $('section h2').last().append(sub_btn);
	}

	$(document).on('click', '#Video_download', function() {
		chrome.runtime.sendMessage({
			url: $($('video').get(0)).attr('src'),
			filename: $.trim($('ul li.active p').text().split(', current section')[0])+'.mp4'
		});
	});
	
	$(document).on('click', '#Subtitle_download', function() {
		var subtitle_url = $($('#seq_content').find('.video').get(0)).attr('data-transcript-translation-url') + '/zh';		
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4 && xhr.status == 200) {
				var subtitles = [];
				var subtitle_json = JSON.parse(xhr.responseText);
				var len = subtitle_json.start.length;
				for (var i = 0; i < len; ++i) {
					var start = parseTime(subtitle_json.start[i]);
					var end = parseTime(subtitle_json.end[i]);
					var text = subtitle_json.text[i];
					subtitles.push(i + 1);
					subtitles.push(start+' --> '+end);
					subtitles.push(text);
					subtitles.push('');
				}
				var blob = new Blob([subtitles.join('\r\n')]);
				var blob_url = URL.createObjectURL(blob);
				chrome.runtime.sendMessage({
					url: blob_url,
					filename: $.trim($('ul li.active p').text().split(', current section')[0])+'.srt'
				});
			}
		};
		xhr.open("GET", subtitle_url, true);
		xhr.send(null);
	});
})(jQuery);