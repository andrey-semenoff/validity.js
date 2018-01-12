/*
** Jquery plugin for validate forms
** Created by Andrey Semenoff
** GNU lisence
*/
(function($){
	$.validityLanguage_en = function() {
			return messages = {
				required: 'Field %name must be filled',
				email: 'Enter valid (xxxxxx@xxx.xxx)',
				tel: 'Enter valid phone (0123456789)',
				length_min: 'Minimal %name field\'s length - %x symbols',
				length_max: 'Maximal %name field\'s length - %x symbols',
				lengthNotOptional: 'Field %name has wrong set up',
				min: '%name Field\'s value cannot be less %x',
				max: '%name Field\'s value cannot be more %x',
				maxlength: 'Maximal %name field\'s langth - %x symbols',
				pattern: 'Field %name filling is wrong',
				number: 'Field %name value must be a number',
			};
		}
})(jQuery);