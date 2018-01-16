/*! Validity.js v.1.0.0
** Jquery plugin for validate forms
** (c) Andrey Semenoff (andrey.semenoff@gmail.com)
** Free lisence
*/
(function($){
	$.fn.extend({
		validity: function(options) {
			var $forms = $(this),
					stopSpam = false, 
					defaults = {
						debug: false,
						validateControls: 'input:not([type=hidden],[type=image],[type=reset],[type=submit],[type=button],[type=file]), textarea, select',
						excludeControls: 'input[type=radio], input[type=checkbox]',
						
						input: {
							className: 'validity-input',
							styling: true,
							success: {
								className: 'validity-input_success'
							},
							error: {
								className: 'validity-input_error'
							}
						},

						inputMsg: {
							className: 'validity-input-msg',
							show: true,
							position: 'absolute|top[50%]/right[2px]/transform[translateY(-50%)]',
							parent: 'auto',
							errorBox: {
								className: false,
								errorBoxParent: 'auto',
							},
							tooltip: true,
							tooltipClass: 'validity-tooltip',
							tooltipType: 'validity-tooltip_left',
							tooltipPos: 'right[100%]/top[50%]/transform[translateY(-50%)]',
							success: {
								className: 'validity-input-msg_success',
								msg: "&#10003;",
								tooltip: false
							},
							error: {
								className: 'validity-input-msg_error'
							}
						},

						formMsg: {
							className: 'msgBox',

						},

						language: null,
						show_names: true,
						detectIntervention: true,
						
						focusInvalid: true,
						formInvalidMsg: true,

						ajax: false,
						action: '/',
						method: 'POST',
						dataType: 'json',
						cache: false,

						onValidationOk: function(e, $form) {
							configure_form($form);

							if( defaults.ajax ) {
								e.preventDefault();
								
								var formData = $form.serialize();
								if(defaults.debug) console.log('%c Ajax sending...', 'color: white; background-color: blue;');
								if(defaults.debug) console.log(formData);

								$.ajax({
									method: defaults.method,
									url: defaults.action,
									data: formData,
									dataType: defaults.dataType,
									cache: defaults.cache,
									success: function(data) {
										defaults.onAjaxOk(data, $form);
									},
									error: function(data) {
										if(defaults.debug) console.log('error');
										if(defaults.debug) console.log(data);
									}
								}).always(function () {
									stopSpam = false;
								});

							} else {
								console.log('reload');
							}
						},
						onValidationError: function($form, message, status) {
							stopSpam = false;
						},
						onAjaxOk: function(data, $form) {
							if(defaults.debug) console.log('%c Ajax success!', 'color: white; background-color: green;');
							if(defaults.debug) console.log(data);

							data.status = true; // Delete
							data.msg = "Ваш запрос успешно отправлен!"; // Delete

				      var status = 'error';

				      if( data.status ) {
				        status = 'success';
								$form.find('.'+ defaults.input.className).removeClass(defaults.input.className + " " + defaults.input.success.className);
								$form[0].reset();
				      }

				      defaults.showFormMsg($form, data.msg, status);
						},

						onAjaxError: function(data, $form) {
							if(defaults.debug) console.log('%c Ajax error!', 'color: white; background-color: red;');
							if(defaults.debug) console.log(data);
						},

						showFormMsg: function($form, msg, status) {
							var $msgBox = $('.'+ defaults.formMsg.className),
									msgBox_height = 0;

							if( !$msgBox.length ) {
								$form.append("<div class='"+ defaults.formMsg.className +"'></div>").css('position', 'relative');
							}

							$msgBox = $('.'+ defaults.formMsg.className).addClass(defaults.formMsg.className + '_'+ status);

							$msgBox.html(msg);
							msgBox_height = $msgBox.outerHeight();

							$msgBox.css('top', '-'+ msgBox_height +'px');

							$msgBox.fadeIn('fast', 'linear', function () {
								$(this).animate({ opacity: 1, 'top': "+="+ msgBox_height }, 500);
							});

							setTimeout(function () {
								$msgBox.animate({ opacity: 0, top: "-="+ msgBox_height }, 500, function () {
									$(this).fadeOut(function () {
										$(this).remove();
									});
								});
							}, 4000);
						}
					},

					messages = {
						required: 'Поле %name не должно быть пустым',
						email: 'Введите email в правильном формате (xxxxxx@xxx.xxx)',
						tel: 'Введите телефон в правильном формате (0123456789)',
						length_min: 'Минимальная длина поля %name - %x символов',
						length_max: 'Максимальная длина поля %name - %x символов',
						lengthNotOptional: 'Поле %name неверно настроено',
						min: 'Значение поля %name должно быть числом >= %x',
						max: 'Значение поля %name должно быть числом <= %x',
						maxlength: 'Максимальная длина поля %name - %x символов',
						pattern: 'Поле %name заполнено неверно',
						number: 'Значение поля %name должно быть числом',
						form_send_ok: 'Данные успешно отправлены!',
						form_send_error: 'Данные не удалось отправить!',
						detect_intervention: 'Обраружено вмешательство в код формы!',
						validation_error: 'Обнаружены ошибки при заполнении полей формы!'
					},
					rules = {
						'required': function(val) {
							if( val !== '' ) return {status: true};
							else return {status: false, msg: messages.required};
						},
						'email': function(val) {
							var regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				    	if( regexp.test(val) ) return {status: true};
				    	else return {status: false, msg: messages.email}
						},
						'tel': function(val) {
							var regexp = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
				    	if( regexp.test(val) ) return {status: true};
				    	else return {status: false, msg: messages.tel}
						},
						'length': function(val, params) {
							if( params.length ) {
								var min = params[0];
								if( params.length > 1 ) {
									var max = params[1];
									if( val.length > max ) return {status: false, msg: messages.length_max.replace('%x', max)};
								}
								
								if( val.length < min ) return {status: false, msg: messages.length_min.replace('%x', min)};
								
								return {status: true};
							} else return {status: false, msg: messages.lengthNotOptional};
						},
						'min': function(val, min) {
							val = parseInt(val);
							min = parseInt(min);
							if( Number.isInteger(val) && val >= min ) return {status: true};
							else return {status: false, msg: messages.min.replace('%x', min)};
						},
						'max': function(val, max) {
							val = parseInt(val);
							max = parseInt(max);
							if( Number.isInteger(val) && val <= max ) return {status: true};
							else return {status: false, msg: messages.max.replace('%x', max)};
						},
						'maxlength': function(val, num) {
							if( val.length < num ) return {status: true};
							else return {status: false, msg: messages.maxlength.replace('%x', num)};
						},
						'pattern': function(val, regexp) {
				    	if( regexp.test(val) ) return {status: true};
				    	else return {status: false, msg: messages.pattern}
						},
						'number': function(val) {
				    	if( Number.isInteger(parseInt(val)) ) return {status: true};
							else return {status: false, msg: messages.number};
						},
						'type': function(val, type) {
							var response; 
							switch( type ) {
								case 'email':
									response = rules['email'](val);
									break;
								case 'tel':
									response = rules['tel'](val);
									break;
								case 'password':
									response = rules['length'](val, [3]);
									break;
								case 'textarea':
									response = rules['length'](val, [6]);
									break;
								case 'number':
									response = rules['number'](val);
									break;
								case 'range':
									response = rules['number'](val);
									break;
								case 'url':
									response = rules['pattern'](val, /^((http[s]?|ftp):\/\/)?[^\.]\w+\.\w+(\.\w+)*\/?(\w+\/?)*(\?([\w\-]+|([\w\-]+=[\w\-]+))?)?(#[\w\-]*)?$/);
									break;
								default:
									response = rules['required'](val);
							}

				    	return response;
						},

					};

			// Run plugin
			init(options);

			// Update defaults with options, run forms' analyzer
			function init(options) {
				$.extend(true, defaults, options);

				if( defaults.language ) {
					messages = $['validityLanguage_' + defaults.language]();
				}

				if( defaults.rules ) {
					$.extend(rules, defaults.rules);
				}

				analizeForms();
			}

			// Analize forms, create input set, bind form events
			function analizeForms() {
				$forms.each(function() {
					var $form = $(this),
							fieldset = [];

					$form.find(defaults.validateControls).not(defaults.excludeControls).each(function() {
						var $this = $(this),
								name = $this.attr('name'),
								attributes = $this[0].attributes;

						fieldset[name] = [];
						fieldset[name]['tagName'] = $this[0].tagName.toLowerCase();
						fieldset[name]['type'] = $this[0].type;
						
						var rules = '';
						if( $this.data('rules') ) {
							rules = $this.data('rules').split('|');
							rules.forEach(function(item, i) { rules[i] = item.replace(/\s/g, "") })
						}
						fieldset[name]['rules'] = rules;

						var attr = ['required', 'maxlength', 'pattern', 'min', 'max'];
						fieldset[name]['attr'] = [];
						attr.forEach(function(item) {
							if( item in attributes ) {
								fieldset[name]['attr'][item] = $this.prop(item);
							}
						});
						fieldset[name]['attr']['type'] = fieldset[name]['type'];
					});
					
					if( defaults.debug ) console.log(fieldset);
					
					$form.attr('novalidate', true);
					

					$form.submit(function(e) {
						// e.preventDefault();
						if( stopSpam ) return false;
						else stopSpam = true;
						
						$form.find('button, input[type="submit"]').attr('disabled', true);
						$('.'+ defaults.formMsg.className).remove();

						// Validate form
						if( validate($form, fieldset) ) {
							if( defaults.debug ) console.log('%c Validation success!', 'color: white; background-color: green;');
							defaults.onValidationOk(e, $form);
						} else {
							if( defaults.debug ) console.log('%c Validation failed!', 'color: white; background-color: red;');
							if( defaults.focusInvalid ) $form.find('.'+ defaults.input.error.className).first().focus();
							if( defaults.formInvalidMsg && !$('.msgBox').length ) defaults.showFormMsg($form, messages.validation_error, 'error');
							defaults.onValidationError($form, messages.validation_error, 'error');
							return false;
						}
					});
				});
			}

			// Validate set of form's inputs
			function validate($form, fieldset) {
				var isValid = true;

				$form.find('.'+defaults.inputMsg.className).remove();

				for( name in fieldset ) {
					var $field = $form.find('[name='+ name +']'),
							field_value = '',
							show_name = '',
							testValid,
							errorMsg = '',
							status = '';

					if( $field.length > 0 ) {
						field_value = $field.val().trim();	
						$field.val(field_value);
					} else {
						if( defaults.debug ) console.log('%c Field "'+ name + '" have been lost or modified!', 'color: white; background-color: red;');
						
						if( defaults.detectIntervention ) {
							if(defaults.debug) console.log('%c '+ messages.detect_intervention, 'background-color: red; color: white;');
							defaults.showFormMsg($form, messages.detect_intervention, 'error');
							isValid = false;
							break;
						} else {
							continue;
						}
					}


					if( defaults.show_names && $field.data('fieldname') ) show_name = '"' + $field.data('fieldname') + '" ';

					// validate by rules
					if( fieldset[name].rules.length > 0 ) {
						if( field_value.length == 0 && fieldset[name].rules.indexOf('required') == -1 ) {
							testValid = {status: true};
						} else {
							fieldset[name].rules.forEach(function(rule) {
								if( defaults.debug ) console.log('field = '+ name +' ; rule = '+rule);
								var rule_params = rule.match(/\([^\)]*\)/);
								rule = rule.replace(/\(.*\)/, '');

								if( rule_params !== null ) {
									rule_params = rule_params[0].replace(/[\(\)]/g, '');
									testValid = rules[rule](field_value, rule_params.split(','));
								} else {
									testValid = rules[rule](field_value);
								}

								if( !testValid.status && errorMsg == '' ) errorMsg = testValid.msg.replace(/%name\W/, show_name);
							});
						}

					// validate by input type and attributes
					} else if( Object.keys(fieldset[name].attr).length > 0 ) {
						if( field_value.length == 0 && !fieldset[name].attr.hasOwnProperty('required') ) {
							testValid = {status: true};
						} else {
							for( attr in fieldset[name].attr ) {
								if( defaults.debug ) console.log('field = '+ name +' ; attr = '+attr);
								testValid = rules[attr](field_value, fieldset[name].attr[attr]);

								if( !testValid.status && errorMsg == '' ) errorMsg = testValid.msg.replace(/%name\W/, show_name);
							}
						}
					} else {
						testValid = {status: true};
					}

					if( errorMsg !== '' ) {
						status = 'error';
					} else {
						status = 'success';
					}

					if( defaults.input[status].styling !== undefined ? defaults.input[status].styling : defaults.input.styling ) {
						inputStyling($field, status);
					}

					if( !(defaults.inputMsg.errorBox.className && status == 'success') ) {
						if( defaults.inputMsg[status].show !== undefined ? defaults.inputMsg[status].show : defaults.inputMsg.show ) {
							showInputMsg($field, (status == 'error' ? errorMsg : defaults.inputMsg.success.msg), status);
						}
					}

					// Hide msg and style input after change
					$field.keypress(function() {
						$field.removeClass(defaults.input.error.className + " " +defaults.input.success.className);
						
						if( defaults.inputMsg.errorBox.className ) {
							$('.'+ defaults.inputMsg.errorBox.className).html('');
						} else {
							var parent = defaults.inputMsg[status].parent !== undefined ? defaults.inputMsg[status].parent : defaults.inputMsg.parent,
								$parent = $field.parent();


							if( parent != 'auto' ) {
								$parent = $field.closest(parent);
							}

							$parent.find('.'+defaults.inputMsg.className).remove();
						}
					});

					if ( isValid ) isValid = testValid.status;
				}

				return isValid;
			}

			// Add some attribute to <form> tag
			function configure_form($form) {
				if( !$form.attr('method') || $form.attr('method') == '' ) {
					$form.attr('method', defaults.method);
				}
				if( !$form.attr('action') || $form.attr('action') == '' ) {
					$form.attr('action', defaults.action);
				}
			}

			function inputStyling($field, status) {
				var className = '';
				if( status == 'error' ) {
					className = defaults.input.error.className;
					$field.removeClass(defaults.input.success.className);
				} else if( status == 'success' ) {
					className = defaults.input.success.className;
					$field.removeClass(defaults.input.error.className);
				}

				if( !$field.hasClass(className) ) $field.addClass(defaults.input.className+" "+ className);
			}

			// Show message with result of input validation
			function showInputMsg($field, msg, status) {
				var position = defaults.inputMsg[status].position !== undefined ? defaults.inputMsg[status].position.split('|') : defaults.inputMsg.position.split('|'),
						className = defaults.inputMsg[status].className;
				
				if( defaults.inputMsg.errorBox.className ) {
					
					if( $('.'+ defaults.inputMsg.errorBox.className).length == 0 ) {
						if( defaults.inputMsg.errorBox.parent == 'auto' ) $errorBoxParent = $field.parents('form');
						else $errorBoxParent = $(defaults.inputMsg.errorBox.parent);
						
						$errorBoxParent.prepend("<div class='"+ defaults.inputMsg.errorBox.className +"'></div>");
					}

					var $errorBox = $('.'+ defaults.inputMsg.errorBox.className);

					$errorBox.append("<div class='"+ defaults.inputMsg.className +" "+ defaults.inputMsg.className +"_static "+ className +"'>"+ msg +"</div>");
				} else {
					var parent = defaults.inputMsg[status].parent !== undefined ? defaults.inputMsg[status].parent : defaults.inputMsg.parent,
							$parent = $field.parent();

					if( parent != 'auto' ) {
						$parent = $field.closest(parent);
					}
	
					if( position[0] == 'static' ) {
						$parent.append("<div class='"+ defaults.inputMsg.className +" "+ defaults.inputMsg.className +"_static "+ className +"'>"+ msg +"</div>");
					} else {
						var style = 'position:' + position[0] +';',
						tooltip = '';

						positions = position[1].split('/');

						positions.forEach(function(pos) {
							var pos_name, pos_param; 

							if( /\[.*\]/.test(pos) ) {
								pos_name = pos.replace(/\[.*\]/, '');
								pos_param = pos.match(/\[.*\]/)[0].replace(/[\[\]]/g, '');
							} else {
								pos_name = pos;
								pos_param = 0;
							}
							style += pos_name + ': '+ pos_param +';';
						});

						// Add tooltip arrow
						if( defaults.inputMsg[status].tooltip !== undefined ? defaults.inputMsg[status].tooltip : defaults.inputMsg.tooltip ) {
							if( position[0] == 'absolute' ) {
								var tooltip_style = 'position: absolute;',
										tooltip_pos = defaults.inputMsg[status].tooltipPos !== undefined ? defaults.inputMsg[status].tooltipPos : defaults.inputMsg.tooltipPos,
										tooltip_type = defaults.inputMsg[status].tooltipType !== undefined ? defaults.inputMsg[status].tooltipType : defaults.inputMsg.tooltipType;

								tooltip_pos.split('/').forEach(function(pos) {
									var pos_name, pos_param;
									if( /\[.*\]/.test(pos) ) {
										tooltip_pos_name = pos.replace(/\[.*\]/, '');
										tooltip_pos_param = pos.match(/\[.*\]/)[0].replace(/[\[\]]/g, '');
									} else {
										tooltip_pos_name = pos;
										tooltip_pos_param = '100%';
									}

									tooltip_style += tooltip_pos_name + ': '+ tooltip_pos_param +';';
								});

								tooltip = "<div class='"+ defaults.inputMsg.tooltipClass +" "+ tooltip_type +"' style='"+ tooltip_style +"'></div>";
							}
						}

						$parent.css('position', 'relative');
						$parent.append("<div class='"+ defaults.inputMsg.className +" "+ className +"' style='"+ style +"'>"+ msg + tooltip +"</div>")
					}
				}
			}

			return this.init;
		}
	});
})(jQuery);