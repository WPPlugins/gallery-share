function imgClick(a) {
	var b = "";
	if (gs_config_vars["gs_useCSSSel"] == 1)
		b = getImageURL(this);
	else {
		b = getImageURL2(this);
		if (b == "" && gs_config_vars["gs_NGActive"])
			b = getNGImageURL(this)
	}
	gs_op_vars["currImgTitle"] = jQuery(this).attr("title");
	var vScrollY = (window.scrollY === undefined) ? gs_op_vars["wnd"].scrollTop() : window.scrollY;
	var vInnerHeight = (window.innerHeight === undefined) ? gs_op_vars["wnd"].innerHeight() : window.innerHeight;
	gs_op_vars["middle"] = vScrollY + vInnerHeight / 2;
	centerWidth = 200;
	centerHeight = 200;
	gs_op_vars["FBRetries"] = 0;
	gs_op_vars["currImg"] = new Image;
	gs_op_vars["currImg"].onload = imgLoaded;
	gs_op_vars["currImg"].src = b;
	gs_op_vars["center"].css({top: Math.max(0, gs_op_vars["middle"] - centerHeight / 2), width: centerWidth, height: centerHeight, marginLeft: -centerWidth / 2}).show();
	gs_op_vars["overlay"].css("opacity", .8).fadeIn(200);
	jQuery("#gsCenterBox, #gsFooterBox").css("left", gs_op_vars["wnd"].scrollLeft() + gs_op_vars["wnd"].width() / 2);
	gs_op_vars["wnd"].keydown(keyDown);
	gs_op_vars["overlay"].click(closeBox);
	a.preventDefault()
}
function imgLoaded(a) {
	gs_op_vars["center"].className = "";
	gs_op_vars["max_LB_width"] = gs_config_vars["gs_maxLBWidth"] / 100 * gs_op_vars["wnd"].width();
	gs_op_vars["max_LB_height"] = gs_config_vars["gs_maxLBHeight"] / 100 * window.innerHeight;
	var b = gs_op_vars["currImg"].width, c = gs_op_vars["currImg"].height;
	if (b < gs_op_vars["MinW"] && c < gs_op_vars["MinH"]) {
		b = gs_op_vars["MinW"];
		c = gs_op_vars["MinH"];
		gs_op_vars["image"].css("background-size", "auto")
	} else {
		gs_op_vars["image"].css("background-size", "contain");
		if (c > gs_op_vars["max_LB_height"]) {
			b *=
					  gs_op_vars["max_LB_height"] / c;
			c = gs_op_vars["max_LB_height"]
		}
		if (b > gs_op_vars["max_LB_width"]) {
			c *= gs_op_vars["max_LB_width"] / b;
			b = gs_op_vars["max_LB_width"]
		}
		if (c < gs_op_vars["MinH"]) {
			b *= gs_op_vars["MinH"] / c;
			c = gs_op_vars["MinH"]
		}
	}
	gs_op_vars["image"].css({backgroundImage: "url(" + gs_op_vars["currImg"].src + ")", visibility: "hidden", display: ""});
	gs_op_vars["sizer"].width(b + 10);
	jQuery("#gsAutoSize, #gsLeft, #gsRight").height(c + 10);
	gs_op_vars["image"].width(b + 10).height(c + 10);
	gs_op_vars["title"].html(gs_op_vars["currImgTitle"]);
	centerWidth = b + 40;
	centerHeight = c + 20;
	var d = Math.max(0, gs_op_vars["middle"] - centerHeight / 2);
	if (gs_op_vars["center"].height() != centerHeight)
		gs_op_vars["center"].animate({height: centerHeight, top: d}, 200, "swing");
	if (gs_op_vars["center"].width() != centerWidth)
		gs_op_vars["center"].animate({width: centerWidth, marginLeft: -(centerWidth + gs_op_vars["FBCommentWidth"]) / 2}, 300, "swing");
	imgMD5 = "";
	for (i = 0; i < image_list.length; i++)
		if (image_list[i].url == gs_op_vars["currImg"].src) {
			imgMD5 = image_list[i].imgMD5;
			break
		}
	window.location.hash =
			  "gs_img_" + imgMD5;
	gs_op_vars["center"].queue(function() {
		gs_op_vars["footer"].css({width: centerWidth + gs_op_vars["FBCommentWidth"], top: d + centerHeight, marginLeft: -(centerWidth + gs_op_vars["FBCommentWidth"]) / 2, visibility: "hidden", display: ""});
		gs_op_vars["image"].css({display: "none", visibility: "", opacity: ""}).fadeIn(200, generateLRF);
		gs_op_vars["sideBar"].css({width: gs_op_vars["FBCommentWidth"], height: gs_op_vars["center"].height(), top: 0, left: b + 20, visibility: "", display: "", position: "absolute"});
		gs_op_vars["comments"].css({width: gs_op_vars["FBCommentWidth"],
			height: gs_op_vars["center"].height() - 30, top: 30, left: 0, visibility: "", display: "", position: "absolute"});
		jQuery("#gsTitle").css({width: gs_op_vars["FBCommentWidth"], height: 30, top: 0, left: 0, visibility: "", display: "", position: "absolute"}).html(gs_config_vars["gs_blogTitle"]);
		jQuery("body").css("overflow", "hidden");
		findPrevNextImg();
		loadComments(imgMD5)
	})
}
function navigateToImageHash() {
	if (window.location.hash.substr(0, 8) == "#gs_img_") {
		var a = window.location.hash.substr(8);
		for (i = 0; i < image_list.length; i++)
			if (image_list[i].imgMD5 == a) {
				image_list[i].imgObj.click();
				break
			}
	}
}
function findPrevNextImg() {
	gs_op_vars["prevImg"] = null;
	gs_op_vars["nextImg"] = null;
	for (i = 0; i < image_list.length; i++)
		if (image_list[i].url == gs_op_vars["currImg"].src) {
			if (i > 0)
				gs_op_vars["prevImg"] = i - 1;
			else
				gs_op_vars["prevImg"] = image_list.length - 1;
			if (i < image_list.length - 1)
				gs_op_vars["nextImg"] = i + 1;
			else
				gs_op_vars["nextImg"] = 0;
			break
		}
}
function getImageURL(a) {
	var b = jQuery(a).attr("href"), c = /attachment_id=\d+$/;
	if (c.test(b))
		b = jQuery(a).find("img").attr("src");
	return b
}
function getImageURL2(a) {
	var b = "", c = "", d = /attachment_id=\d+$/;
	var e = a.src;
	var f = "";
	var g = a.parentElement;
	if (g.tagName == "A")
		f = g.href;
	if (jQuery.inArray(e, gs_img_list) >= 0) {
		b = e;
		if (f != "" && f.length < b.length && !d.test(f))
			b = f
	} else if (f != "" && jQuery.inArray(f, gs_img_list) >= 0)
		b = f;
	return b
}
function getNGImageURL(a) {
	var b = "";
	a = jQuery(a);
	if (a.parent().prop("tagName").toLowerCase() == "a")
		b = a.parent().attr("href");
	return b
}
function timedCreateImageList() {
	if (typeof b64_md5 !== "undefined" && jQuery.isFunction(b64_md5))
		jQuery.each(jQuery(gs_config_vars["gs_imgCssSel"]), function() {
			var a = getImageURL(this);
			image_list.push({url: a, imgObj: this, imgMD5: b64_md5(a)})
		});
	else if (gs_op_vars["MD5Retries"] < 5) {
		gs_op_vars["MD5Retries"]++;
		setTimeout(timedCreateImageList, 500)
	}
}
function timedCreateImageList2() {
	if (typeof b64_md5 !== "undefined" && jQuery.isFunction(b64_md5)) {
		var a = jQuery("img");
		if (gs_config_vars["gs_NGActive"])
			a = a.add(jQuery(".ngg-gallery-thumbnail a"));
		a.each(function() {
			if (this.tagName.toLowerCase() == "img") {
				var a = getImageURL2(this);
				if (a != "") {
					image_list.push({url: a, imgObj: this, imgMD5: b64_md5(a)});
					jQuery(this).unbind("click");
					jQuery(this).click(imgClick);
					jQuery(this).css("cursor", "pointer")
				}
			} else if (this.tagName.toLowerCase() == "a") {
				var a = getNGImageURL(jQuery(this).find("img"));
				if (a != "") {
					image_list.push({url: a, imgObj: jQuery(this).find("img"), imgMD5: b64_md5(a)});
					jQuery(jQuery(this).find("img")).unbind("click");
					jQuery(jQuery(this).find("img")).click(imgClick);
					jQuery(jQuery(this).find("img")).css("cursor", "pointer")
				}
			}
		})
	} else if (gs_op_vars["MD5Retries"] < 5) {
		gs_op_vars["MD5Retries"]++;
		setTimeout(timedCreateImageList2, 500)
	}
}
function changeImage(a) {
	jQuery("#gsCenterBox, #gsImage, #gsFooterBox").stop(true);
	gs_op_vars["footer"].css("visibility", "hidden");
	gs_op_vars["currImgTitle"] = image_list[a].imgObj.title;
	gs_op_vars["currImg"] = new Image;
	gs_op_vars["currImg"].onload = imgLoaded;
	gs_op_vars["currImg"].src = image_list[a].url;
	gs_op_vars["FBRetries"] = 0
}
function generateLRF() {
	if (gs_op_vars["prevImg"] != null) {
		gs_op_vars["leftLink"].click(function(a) {
			changeImage(gs_op_vars["prevImg"]);
			a.preventDefault()
		});
		gs_op_vars["leftLink"].show()
	} else {
		gs_op_vars["leftLink"].hide();
		gs_op_vars["leftLink"].unbind("click")
	}
	if (gs_op_vars["nextImg"] != null) {
		gs_op_vars["rightLink"].click(function(a) {
			changeImage(gs_op_vars["nextImg"]);
			a.preventDefault()
		});
		gs_op_vars["rightLink"].show()
	} else {
		gs_op_vars["rightLink"].hide();
		gs_op_vars["rightLink"].unbind("click")
	}
	gs_op_vars["footer"].css("marginTop",
			  -gs_op_vars["footer"].offsetHeight).animate({marginTop: 0}, 400);
	gs_op_vars["footer"].css("visibility", "")
}
function loadComments(a) {
	var b = "", c = {}, d = location.search.substring(1), e = /([^&=]+)=([^&]*)/g, f;
	while (f = e.exec(d))
		if (f !== null)
			c[decodeURIComponent(f[1])] = decodeURIComponent(f[2]);
	c["gs_img"] = a;
	if (window.location.hash.substr(0, 8) == "#gs_img_")
		b = (window.location + "").replace(window.location.hash, "");
	b = b.replace(window.location.search, "");
	b += "?" + decodeURIComponent(jQuery.param(c));
	var g = '<div id="gsShare" style="margin-top: 10px"><div class="fb-like" data-href="' + b + '" data-send="true" data-width="' + gs_op_vars["FBCommentWidth"] +
			  '" data-show-faces="' + (gs_config_vars["gs_ldFBPics"] ? "true" : "false") + '"></div></div>';
	if (gs_config_vars["gs_ldFBComm"])
		g += '<div id="gsFBComm"><div class="fb-comments" data-href="' + b + '" data-num-posts="5" data-width="' + gs_op_vars["FBCommentWidth"] + '"></div></div>';
	jQuery("#gsComments").html(g);
	gs_op_vars["center"].width(gs_op_vars["center"].width() + gs_op_vars["FBCommentWidth"]);
	timedLoadFb()
}
function timedLoadFb() {
	if (typeof FB !== "undefined") {
		FB.Event.subscribe("edge.create", function(a) {
			jQuery("iframe.fb_iframe_widget_lift").parent().width(450)
		});
		FB.XFBML.parse()
	} else if (gs_op_vars["FBRetries"] < 5) {
		gs_op_vars["FBRetries"]++;
		setTimeout(timedLoadFb, 500)
	}
}
function closeBox() {
	try {
		gs_op_vars["currImg"].onload = null;
		gs_op_vars["currImg"] = null
	} catch (a) {
	}
	jQuery("#gsCenterBox, #gsImage, #gsFooterBox").stop(true);
	jQuery("#gsCenterBox, #gsLeft, #gsRight, #gsImage, #gsFooterBox").hide();
	jQuery("#gsOverlay").fadeOut(300);
	jQuery("body").css("overflow", "auto");
	var b = (window.scrollY === undefined) ? gs_op_vars["wnd"].scrollTop() : window.scrollY;
	window.location.hash = "";
	gs_op_vars["wnd"].scrollTop(b)
}
function keyDown(a) {
	switch (a.which) {
		case 27:
			closeBox();
			a.preventDefault();
			break;
		case 37:
			gs_op_vars["leftLink"].click();
			a.preventDefault();
			break;
		case 39:
			gs_op_vars["rightLink"].click();
			a.preventDefault();
			break
		}
}
var gs_op_vars = {}, image_list = [];
gs_op_vars["FBCommentWidth"] = 400;
gs_op_vars["MD5Retries"] = 0;
gs_op_vars["MinH"] = 400;
gs_op_vars["MinW"] = 300;
jQuery(document).ready(function() {
	jQuery("body").append('<div style="display: none;" id="gsOverlay"></div><div id="gsCenterBox" style="display: none;"><div id="gsImage"><div style="position: relative;" id="gsAutoSize"><a id="gsLeft" href="#"></a><a id="gsRight" href="#"></a></div></div><div id="gsSideBar" style="display:none"><div id="gsTitle"></div><div id="gsComments"></div></div><div id="gsClose" onclick="closeBox();"></div></div><div id="gsFooterBox" style="display: none;"><div id="gsFooter"><div id="gsImgTitle"></div><div id="gsImgNo"></div><div id="gsPowered">Powered by Gallery Share</div><div style="clear: both;"></div></div></div>');
	if (gs_config_vars["gs_ldFBScript"] ==
			  1)
		jQuery("body").append('<div id="fb-root"></div><script>(function(d, s, id) {  var js, fjs = d.getElementsByTagName(s)[0];  if (d.getElementById(id)) return;  js = d.createElement(s); js.id = id;  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=' + gs_config_vars["gs_FBAppId"] + "\";  fjs.parentNode.insertBefore(js, fjs);}(document, 'script', 'facebook-jssdk'));\x3c/script>");
	gs_op_vars["center"] = jQuery("#gsCenterBox");
	gs_op_vars["overlay"] = jQuery("#gsOverlay");
	gs_op_vars["leftLink"] = jQuery("#gsLeft");
	gs_op_vars["rightLink"] = jQuery("#gsRight");
	gs_op_vars["wnd"] = jQuery("html");
	gs_op_vars["sizer"] = jQuery("#gsAutoSize");
	gs_op_vars["footer"] = jQuery("#gsFooterBox");
	gs_op_vars["comments"] = jQuery("#gsComments");
	gs_op_vars["sideBar"] = jQuery("#gsSideBar");
	gs_op_vars["image"] = jQuery("#gsImage");
	gs_op_vars["title"] = jQuery("#gsImgTitle");
	if (gs_config_vars["gs_useCSSSel"] == 1) {
		jQuery(gs_config_vars["gs_imgCssSel"]).unbind("click");
		jQuery(gs_config_vars["gs_imgCssSel"]).click(imgClick);
		timedCreateImageList()
	} else
		timedCreateImageList2()
});
jQuery(window).load(function() {
	var a = "", b = {}, c = location.search.substring(1), d = /([^&=]+)=([^&]*)/g, e;
	while (e = d.exec(c))
		if (e !== null)
			b[decodeURIComponent(e[1])] = decodeURIComponent(e[2]);
	if (typeof b["gs_img"] !== "undefined")
		window.location.hash = "gs_img_" + b["gs_img"];
	setTimeout(navigateToImageHash, 500)
});