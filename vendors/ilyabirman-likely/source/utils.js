var bool = {yes: true, no: false},
    rUrl = /(https?|ftp):\/\/[^\s\/$.?#].[^\s]*/gi;

/** 
 * @internal
 */
var utils = {
    /**
     * Simple $.each, only for objects
     * 
     * @param {Object} object
     * @param {Function} callback
     */
    each: function (object, callback) {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                callback(object[key], key);
            }
        }
    },

    /**
     * Convert array-like object to array
     * 
     * @param {Object} arrayLike
     * @return {Array}
     */
    toArray: function (arrayLike) {
        return Array.prototype.slice.call(arrayLike);
    },

    /**
     * Merge given dictionaries (objects) into one object
     * 
     * @param {Object} ...objects
     * @return {Object}
     */
    merge: function () {
        var result = {};
    
        for (var i = 0; i < arguments.length; i ++) {
            var arg = arguments[i];
        
            if (arg) {
                for (var key in arg) {
                    result[key] = arg[key];
                }
            }
        }
    
        return result;
    },

    /**
     * Extend one (target) object by other (subject)
     * 
     * @param {Object} target
     * @param {Object} subject
     */
    extend: function (target, subject) {
        for (var key in subject) {
            target[key] = subject[key];
        }
    },

    /**
     * Return node.dataset or plain object for IE 10without setters
     * based on https://gist.github.com/brettz9/4093766#file_html5_dataset.js
     *
     * @param {Node} node
     * @return {Object}
     */
    getDataset: function (node) {
        if (typeof node.dataset === 'object') {
            return node.dataset;
        }
        
        var i,
            dataset = {},
            attributes = node.attributes,
            attribute,
            attributeName;
        
        var toUpperCase = function (n0) {
            return n0.charAt(1).toUpperCase();
        };
        
        for (i = attributes.length - 1; i >= 0; i--) {
            attribute = attributes[i];
            if (attribute && attribute.name &&
                (/^data-\w[\w\-]*$/).test(attribute.name)) {
                    attributeName = attribute.name.substr(5).replace(/-./g, toUpperCase);
                    dataset[attributeName] = attribute.value
                }
        }
        
        return dataset;
    },

    /**
     * Convert "yes" and "no" to true and false.
     * 
     * @param {Node} node
     */
    bools: function (node) {
        var result = {},
            data   = utils.getDataset(node);
    
        for (var key in data) {
            var value = data[key];
        
            result[key] = bool[value] || value;
        }
    
        return result;
    },

    /**
     * Map object keys in string to its values
     * 
     * @param {String} text
     * @param {Object} data
     * @return {String}
     */
    template: function (text, data) {
        return !text ? '' : text.replace(/\{([^\}]+)\}/g, function (value, key) {
            return key in data ? data[key] : value;
        });
    },

    /**
     * Map object keys in URL to its values
     * 
     * @param {String} text
     * @param {Object} data
     * @return {String}
     */
    makeUrl: function (text, data) {
        for (var key in data) {
            data[key] = encodeURIComponent(data[key]);
        }
    
        return utils.template(text, data);
    },

    /**
     * Create query string out of data
     * 
     * @param {Object} data
     * @return {String}
     */
    query: function (data) {
        var filter = encodeURIComponent,
            query  = [];
    
        for (var key in data) {
            if (typeof data[key] === 'object') continue;
        
            query.push(filter(key) + '=' + filter(data[key]));
        }
    
        return query.join('&');
    },

    /**
     * Set value in object using dot-notation
     * 
     * @param {Object} object
     * @param {String} key
     * @param {Object} value
     */
    set: function (object, key, value) {
        var frags = key.split('.'),
            last  = null;
    
        frags.forEach(function (key, index) {
            if (typeof object[key] === 'undefined') {
                object[key] = {};
            }
        
            if (index !== frags.length - 1) {
                object = object[key];
            }
        
            last = key;
        });
    
        object[last] = value;
    }
};

module.exports = utils; 