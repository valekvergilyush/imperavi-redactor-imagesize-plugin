if (!RedactorPlugins) var RedactorPlugins = {};

RedactorPlugins.imagesize = function()
{
	return {
	init: function()
	{
		$('#redactor-image-width').live('keyup', function (){
			var oldWidth=$('#redactor-image-width-hide').val();
			var oldHeight=$('#redactor-image-height-hide').val();
			var newWidth=$('#redactor-image-width').val();
			var newHeight=(newWidth*oldHeight/oldWidth).toFixed();
			$('#redactor-image-height').val(newHeight);
		});

		$('#redactor-image-height').live('keyup', function (){
			var oldWidth=$('#redactor-image-width-hide').val();
			var oldHeight=$('#redactor-image-height-hide').val();
			var newHeight=$('#redactor-image-height').val();
			var newWidth=(newHeight*oldWidth/oldHeight).toFixed();
			$('#redactor-image-width').val(newWidth);
		});



		var lang = {width: 'Width', height: 'Height',};
		$.extend(this.opts.langs.en, lang);

		var langru = {width: 'Ширина', height: 'Высота',};
		$.extend(this.opts.langs.ru, langru);

		this.opts.modal = {
			imageEdit: String()
			+ '<section id="redactor-modal-image-edit">'
			+ '<div style="float:left;">'
			+ '<label>' + this.lang.get('width') + '</label>'
			+ '<input type="text" id="redactor-image-width" style="width:100px; margin-right: 25px;"/>'
			+ '</div><div style="float:left;">'
			+ '<label>' + this.lang.get('height') + '</label>'
			+ '<input type="text" id="redactor-image-height"  style="width:100px;"/>'
			+ '</div><div style="clear:both; margin-bottom: 25px;"></div>'
			+ '<input type="hidden" id="redactor-image-width-hide" />'
			+ '<input type="hidden" id="redactor-image-height-hide" />'
				+ '<label>' + this.lang.get('title') + '</label>'
				+ '<input type="text" id="redactor-image-title" />'
				+ '<label class="redactor-image-link-option">' + this.lang.get('link') + '</label>'
				+ '<input type="text" id="redactor-image-link" class="redactor-image-link-option" />'
				+ '<label class="redactor-image-link-option"><input type="checkbox" id="redactor-image-link-blank"> ' + this.lang.get('link_new_tab') + '</label>'
				+ '<label class="redactor-image-position-option">' + this.lang.get('image_position') + '</label>'
				+ '<select class="redactor-image-position-option" id="redactor-image-align">'
					+ '<option value="none">' + this.lang.get('none') + '</option>'
					+ '<option value="left">' + this.lang.get('left') + '</option>'
					+ '<option value="center">' + this.lang.get('center') + '</option>'
					+ '<option value="right">' + this.lang.get('right') + '</option>'
				+ '</select>'
			+ '</section>',

			image: String()
			+ '<section id="redactor-modal-image-insert">'
				+ '<div id="redactor-modal-image-droparea"></div>'
				+ '</section>',

			file: String()
			+ '<section id="redactor-modal-file-insert">'
				+ '<div id="redactor-modal-file-upload-box">'
					+ '<label>' + this.lang.get('filename') + '</label>'
					+ '<input type="text" id="redactor-filename" /><br><br>'
					+ '<div id="redactor-modal-file-upload"></div>'
				+ '</div>'
			+ '</section>',

			link: String()
			+ '<section id="redactor-modal-link-insert">'
				+ '<label>URL</label>'
				+ '<input type="url" id="redactor-link-url" />'
				+ '<label>' + this.lang.get('text') + '</label>'
				+ '<input type="text" id="redactor-link-url-text" />'
				+ '<label><input type="checkbox" id="redactor-link-blank"> ' + this.lang.get('link_new_tab') + '</label>'
			+ '</section>'
		};


		$.extend(this.opts, this.opts.modal);

		var redactor = this;


		this.image.showEdit = function($image)
				{
					var $link = $image.closest('a');

					redactor.modal.load('imageEdit', redactor.lang.get('edit'), 705);

					redactor.modal.createCancelButton();
					redactor.image.buttonDelete = redactor.modal.createDeleteButton(redactor.lang.get('_delete'));
					redactor.image.buttonSave = redactor.modal.createActionButton(redactor.lang.get('save'));

					redactor.image.buttonDelete.on('click', $.proxy(function()
					{
						redactor.image.remove($image);

					}, redactor));

					redactor.image.buttonSave.on('click', $.proxy(function()
					{
						redactor.image.update($image);

					}, redactor));
					$('#redactor-image-width').val($image.css('width').replace('px',''));
					$('#redactor-image-height').val($image.css('height').replace('px',''));

					$('#redactor-image-width-hide').val($image.css('width').replace('px',''));
					$('#redactor-image-height-hide').val($image.css('height').replace('px',''));

					$('#redactor-image-title').val($image.attr('alt'));

					if (!redactor.opts.imageLink) $('.redactor-image-link-option').hide();
					else
					{
						var $redactorImageLink = $('#redactor-image-link');

						$redactorImageLink.attr('href', $image.attr('src'));
						if ($link.size() !== 0)
						{
							$redactorImageLink.val($link.attr('href'));
							if ($link.attr('target') == '_blank') $('#redactor-image-link-blank').prop('checked', true);
						}
					}

					if (!redactor.opts.imagePosition) $('.redactor-image-position-option').hide();
					else
					{
						var floatValue = ($image.css('display') == 'block' && $image.css('float') == 'none') ? 'center' : $image.css('float');
						$('#redactor-image-align').val(floatValue);
					}

					redactor.modal.show();

				};


				this.image.update = function($image)
				{
					redactor.image.hideResize();
					redactor.buffer.set();

					var $link = $image.closest('a');

					$image.attr('alt', $('#redactor-image-title').val());

					redactor.image.setFloating($image);

					var width = $('#redactor-image-width').val();
					//var height = $('#redactor-image-height').val();


					if(width !== '' && width != 0 && width !== '0')
					{
						$image.css({ 'width': width + 'px'});
						//$image.attr('width', width);
					}
					else
					{
						$image.css({ 'width': 'auto'});
					}


					// as link
					var link = $.trim($('#redactor-image-link').val());
					if (link !== '')
					{
						var target = ($('#redactor-image-link-blank').prop('checked')) ? true : false;

						if ($link.size() === 0)
						{
							var a = $('<a href="' + link + '">' + redactor.utils.getOuterHtml($image) + '</a>');
							if (target) a.attr('target', '_blank');

							$image.replaceWith(a);
						}
						else
						{
							$link.attr('href', link);
							if (target)
							{
								$link.attr('target', '_blank');
							}
							else
							{
								$link.removeAttr('target');
							}
						}
					}
					else if ($link.size() !== 0)
					{
						$link.replaceWith(redactor.utils.getOuterHtml($image));

					}

					redactor.modal.close();
					redactor.observe.images();
					redactor.code.sync();


				};



		}







};
}