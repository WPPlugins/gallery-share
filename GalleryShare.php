<?php

/*
Plugin Name: Gallery Share
Plugin URI: http://www.galleryshareplugin.com
Description: Share your blog images on social networks with just a click
version: 0.91
Requires at least: 3.3
Author: galleryshareplugin.com
License: GPLv2 or later
*/

/* Plugin variables and constants */
global $galleryShare_admin_menu_slug, $galleryShare_config_vars, $galleryShare_img_list;

$galleryShare_admin_menu_slug = 'gs-plugin-config-page';
$galleryShare_config_vars = Array (
	'is_registered'				=> '1',
	'version'					=> '0.8',//plugin version
	'FB_app_id'					=> '254900821278948',   //Facebook app ID to be used. If none is set by user, use our own
	'load_FB_script'			=> '1',  //if set to 1, include FB script on public page. Set to 0 if the script is loaded by another plugin/widget
	'include_FB_comments'		=> '1',  //show FB comments on each image
	'show_FB_user_pics'			=> '1',  //show FB user pics for the ones who commented on images
	'lightbox_width_perc'		=> '80', //lightbox width as percent of user screen
	'lightbox_height_perc'		=> '80', //lightbox height as percent of user screen
	'css_selector'				=> '.entry-content a:has(img)',	 //CSS selector for selecting the images in the post
	'use_css_selector'			=> '0'
) ;

$galleryShare_img_list = Array ();

/* Create hooks */

register_activation_hook ( __FILE__,'galleryShare_install' ) ;
register_deactivation_hook ( __FILE__,'galleryShare_uninstall' ) ;


/* Public side contents */
//add_action ( 'init', 'galleryShare_init' );
add_action ( 'wp', 'galleryShare_get_attachment_images' ) ;
add_action ( 'wp_enqueue_scripts', 'galleryShare_enqueue_scripts' ) ;
add_action ( 'admin_enqueue_scripts', 'galleryShare_admin_enqueue_scripts' ) ;
add_action ( 'wp_head', 'galleryShare_add_header_contents');

/* Admin side menu and contents */
add_action('admin_menu', 'galleryShare_admin_menu');


function galleryShare_admin_menu () {
	global $galleryShare_admin_menu_slug;

	$plugin_page = add_menu_page( 'Gallery Share Options', 'Gallery Share', 'manage_options', $galleryShare_admin_menu_slug, 'galleryShare_admin_options_page' ) ;
	add_action( 'admin_head-'. $plugin_page, 'galleryShare_admin_header' ) ;
}


function galleryShare_admin_header () {
	//load Facebook script
	global $galleryShare_config_vars;
	galleryShare_load_settings_from_DB();

	if ( empty ( $galleryShare_config_vars['FB_app_id'] ) )
		$FB_app_id = '254900821278948';
	else
		$FB_app_id = $galleryShare_config_vars['FB_app_id'];

	echo '<div id="fb-root"></div><script>(function(d, s, id) { var js, fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) return; js = d.createElement(s); js.id = id; js.src = "//connect.facebook.net/en_GB/all.js#xfbml=1&appId=' . $FB_app_id . '"; fjs.parentNode.insertBefore(js, fjs); }(document, \'script\', \'facebook-jssdk\'));</script>';
	echo '<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>';
}

function galleryShare_admin_options_page() {
	global $wpdb, $galleryShare_config_vars;

	if ( !current_user_can ( 'manage_options' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) ) ;
	}

	galleryShare_admin_options_header();
	$save_success = '';

	if ( !empty( $_POST ) && check_admin_referer( 'gs_save_options', 'gs_save_options_nonce') ) {
 		$save_success = galleryShare_admin_save_options();
	}

	galleryShare_admin_options_form ( $save_success );

	galleryShare_admin_options_footer();
}


function galleryShare_admin_options_header() {
	global $galleryShare_config_vars;

	echo <<<GS_HEADER_END
	<div id="gsAdminMain">
		<div class="wrap">
			<h2>Gallery Share v.{$galleryShare_config_vars['version']} Plugin Configuration</h2>
			<div id="gsAdminSocialNetworks" style="float:left; width:600px">
				<a href="https://twitter.com/share" class="twitter-share-button" data-text="Gallery Share WP Plugin - share each image on your website with just a click!" data-url="http://www.galleryshareplugin.com">Tweet</a>
				<div class="fb-like" data-href="http://www.galleryshareplugin.com" data-send="true" data-width="400" data-show-faces="false"></div>
			</div>
			<div id="gsAdminHeader" style="float:right; width:200px">
				<a href="http://www.galleryshareplugin.com" title="Gallery Share Plugin Homepage" target="_blank">Gallery Share Plugin Homepage</a>
			</div>
			<div style="clear:both"></div>
		</div>
GS_HEADER_END;

}


function galleryShare_admin_options_form($save_success) {
	global $galleryShare_admin_menu_slug, $galleryShare_config_vars;
	$current_url = admin_url() . "admin.php?page=$galleryShare_admin_menu_slug";
	$wp_nonce = wp_nonce_field('gs_save_options', 'gs_save_options_nonce', true, false);

	$message = '';
	$display = 'hidden';
	if ( $save_success === true ) {
		$message = 'Saved';
		$color = 'green';
		$display = '';
	}
	elseif ( $save_success === false ) {
		$message = 'Save failed';
		$color = 'red';
		$display = '';
	}

	if ($galleryShare_config_vars['use_css_selector'] == 1) {
		$selector_type_1 = '';
		$selector_type_2 = 'checked';
	}
	else {
		$selector_type_1 = 'checked';
		$selector_type_2 = '';
	}

	echo <<<GS_OPTIONS_END
	<div id="gsAdminOptions" style="float:left; width:600px;">
		<table id="gsOptionsTable" style="border-spacing:10px; line-height:20px;" >
			<tr>
				<td colspan="2"><h3>Edit Options</h3>
				</td>
			</tr>
			<tr>
				<td valign="middle" >CSS Image Selector
				</td>
				<td>
					<form action="$current_url" method="POST">
						$wp_nonce
						<input type="radio" name="gs_selector_type" value="1" $selector_type_1>Default (all images attached to posts) <br/>
						<input type="radio" name="gs_selector_type" value="2" $selector_type_2>Custom selector:
						<input type="text" name="gs_css_selector" id="gs_css_selector" style="width:300px; float:right" value="{$galleryShare_config_vars['css_selector']}"><br/>
				</td>
			</tr>
			<tr>
				<td colspan="2" style="text-align:right">
						<input class="button" type="submit" name="gs_save" id="gs_save" value="Save">
					</form>
				</td>
			</tr>
			<tr id="gsMessageRow" style="visibility:$display; align:right">
				<td colspan="2" style="text-align:right"><font color="$color"><b>$message</font></b>
				</td>
			</tr>
		</table>
	</div>
	<div id="gsAdminOptionsHelp" style="float:right; width:400px; margin-right: 50px">
	<h3>How to use it</h3>
		<ul style="list-style-type:disc">
		<li>
		<b>Default selector</b>: will work out of the box on most Wordpress installations, including on NextGEN galleries*. The images need to be attached to posts (as opposed to hotlinked) and the image link needs to be pointing to the actual image file, not to the attachment page. <br>
		<i>* In order to use it with NextGEN, you need to go to the NextGEN Options page (Gallery->Options in WP Admin), go to the 'Effects' tab, select 'None' and save.</i>

		</li>
		<li>
		<b>Custom selector (advanced)</b>: you can use that in case you have a particular setup and the default setting doesn't work, or in case you want just certain images to be shown in the lightbox. The default custom selector is ".entry-content a:has(img)", and it works on all images from a default WP theme. <br/>You can build your own custom selector which is a match for your WP theme and use it with the plugin. In most cases you would only need to change the 'entry-content' class name with the one that is being used on your theme.
		</li>
		</ul>

		<br/><br/>

	</div>
	<div style="clear:both"></div>
GS_OPTIONS_END;
}

function galleryShare_admin_save_options() {
	global $galleryShare_config_vars;
	$ret_val = true;
	$selector_value = ( isset ( $_POST['gs_css_selector'] ) ) ? $_POST['gs_css_selector'] : '';
	$selector_type = ( isset ( $_POST['gs_selector_type'] ) && ( $_POST['gs_selector_type'] == 2 ) ) ? 1 : 0;

	if ( $galleryShare_config_vars['css_selector'] != $selector_value ) {
		$galleryShare_config_vars['css_selector'] = $selector_value;
		$ret_val = $ret_val && update_option('galleryShare_css_selector', $selector_value);
	}

	if ( $galleryShare_config_vars['use_css_selector'] != $selector_type ) {
		$galleryShare_config_vars['use_css_selector'] = $selector_type;
		$ret_val = $ret_val && update_option('galleryShare_use_css_selector', $selector_type);
	}

	return $ret_val;
}


function galleryShare_admin_options_footer() {
	echo <<<GS_FOOTER_END
		</div>
		<script>jQuery('#gsMessageRow').fadeIn(2000).fadeOut(4000);</script>
GS_FOOTER_END;
}

/* Install/uninstall/init functions */
function galleryShare_install() {
	global $galleryShare_config_vars;

	foreach ( $galleryShare_config_vars as $config_var => $var_value ) {
		add_option ( 'galleryShare_' . $config_var, $var_value ) ;
	}
}


function galleryShare_uninstall() {
    delete_option ( "galleryShare_version" ) ;
    delete_option ( "galleryShare_is_registered" ) ;
}


function galleryShare_enqueue_scripts(){
	global $galleryShare_admin_menu_slug, $galleryShare_config_vars, $galleryShare_img_list;
	if ( is_singular() ) {
		//In case nobody else loaded jquery up to this point, add it to the queue. This is needed for both admin and user sides
		wp_enqueue_script('jquery');
		wp_enqueue_style ( 'gallerySharePublicCSS', plugins_url( '/css/gallerySharePublic.css',__FILE__ ), array(), 0.8 ) ;

		galleryShare_load_settings_from_DB();

		if ( empty ( $galleryShare_config_vars['FB_app_id'] ) ) {
			$FB_app_id = '254900821278948';
		}
		else {
			$FB_app_id = $galleryShare_config_vars['FB_app_id'];
		}

		if ( $galleryShare_config_vars['load_FB_script'] == 1 ) {
			//do nothing here. The FB script is loaded in JS based on this param
		}

		wp_register_script ( 'md5', plugins_url ( '/js/md5.js',__FILE__ ) , array ( 'jquery' ) );
		wp_enqueue_script ( 'md5' );
		wp_register_script ( 'galleryShare', plugins_url ( '/js/gallerySharePublic.js', __FILE__ ) , array ( 'jquery', 'md5' ) , 0.8 );
		wp_enqueue_script ( 'galleryShare' );
		$JS_params = Array(
			'gs_ldFBScript'		=> $galleryShare_config_vars['load_FB_script'],
			'gs_ldFBComm'		=> $galleryShare_config_vars['include_FB_comments'],
			'gs_ldFBPics'		=> $galleryShare_config_vars['show_FB_user_pics'],
			'gs_imgCssSel'		=> $galleryShare_config_vars['css_selector'],
			'gs_imgPath'		=> plugins_url('/img/',__FILE__),
			'gs_maxLBWidth'		=> $galleryShare_config_vars['lightbox_width_perc'],
			'gs_maxLBHeight'	=> $galleryShare_config_vars['lightbox_height_perc'],
			'gs_blogTitle'		=> get_bloginfo('name'),
			'gs_useCSSSel'		=> $galleryShare_config_vars['use_css_selector'],
			'gs_FBAppId'		=> $FB_app_id
		);
		//if there is an active NextGEN instance, flag it so we can get images from that as well
		if (class_exists('nggdb')) {
			$JS_params['gs_NGActive'] = 1;
		}
		wp_localize_script ( 'galleryShare', 'gs_config_vars', $JS_params ) ;
		wp_localize_script ( 'galleryShare', 'gs_img_list', $galleryShare_img_list ) ;
	}
}

function galleryShare_admin_enqueue_scripts(){
	wp_enqueue_script ( "jquery" ) ;
}


function galleryShare_add_header_contents() {
	global $galleryShare_img_list;
	if ( isset ( $_REQUEST['gs_img'] ) ) {
		foreach ($galleryShare_img_list as $image_link) {
			if ( rtrim ( base64_encode ( pack ( 'H*', md5 ( $image_link ) ) ), "=" ) == $_REQUEST['gs_img'] ) {
				print "\n" . '<meta property="og:image" content="' . $image_link . '"/>';
				print "\n" . '<meta property="og:url" content="http://' . $_SERVER["SERVER_NAME"] . $_SERVER["REQUEST_URI"] . '"/>';
				print "\n" . '<meta property="og:title" content="' . get_bloginfo('name') . wp_title('|', false) . '"/>';
				print "\n" . '<meta property="og:type" content="blog"/>';
				break;
			}
		}
	}
}

/* Loads the plugin parameters from DB and saves them into the global variable galleryShare_config_vars*/
function galleryShare_load_settings_from_DB() {
	global $galleryShare_config_vars;

	foreach ( $galleryShare_config_vars as $config_var => $var_value ) {
		$galleryShare_config_vars[$config_var] = get_option ( 'galleryShare_' . $config_var );
	}
}

/* generates a list of all image attachments that will be displayed */
function galleryShare_get_attachment_images_old ( $wp ) {
	if ( !is_admin() ) {
		global $galleryShare_img_list;

		foreach ( $GLOBALS['posts'] as $post ) {
			if ( $images = get_children ( array(
				'post_parent' => $post->ID,
				'post_type' => 'attachment',
				'order' => 'DESC',
				'numberposts' => -1,
				'post_mime_type' => 'image'))
			) {
				foreach ( $images as $image ) {
					$link = wp_get_attachment_url ( $image->ID );
					$galleryShare_img_list[] = $link;
				}
			}
		}
		wp_localize_script ( 'galleryShare', 'gs_img_list', $galleryShare_img_list ) ;
	}
}

/* gets a list of all images included in the post */
function galleryShare_get_attachment_images ( $wp ) {
	if ( !is_admin() ) {
		global $galleryShare_img_list;

		foreach ( $GLOBALS['posts'] as $post ) {
			if ( $images = get_children ( array(
				'post_parent' => $post->ID,
				'post_type' => 'attachment',
				'order' => 'DESC',
				'numberposts' => -1,
				'post_mime_type' => 'image'))
			) {
				foreach ( $images as $image ) {
					$link = wp_get_attachment_url ( $image->ID );
					$galleryShare_img_list[] = $link;
				}
			}
			if (preg_match_all('/<img.+src=[\'"]([^\'"]+)[\'"].*>/i', $post->post_content, $matches));
				foreach ($matches[1] as $src)
					$galleryShare_img_list[] = $src;

		}
	}
}



