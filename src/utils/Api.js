class Dokan_API  {

    endpoint() {
        return window.dokan.rest.root + window.dokan.rest.version;
    }

    headers() {
        return {
        }
    }

    get(path, data = {} ) {
        return this.ajax(path, 'GET', this.headers(), data);
    }

    post(path, data = {} ) {
        return this.ajax(path, 'POST', this.headers(), data);
    }

    put(path, data = {} ) {
        return this.ajax(path, 'PUT', this.headers(), data);
    }

    delete(path, data = {} ) {
        return this.ajax(path, 'DELETE', this.headers(), data);
    }

    // jQuery ajax wrapper
    ajax(path, method, headers, data) {

        return jQuery.ajax({
            url: this.endpoint() + path,
            beforeSend: function ( xhr ) {
                xhr.setRequestHeader( 'X-WP-Nonce', window.dokan.rest.nonce );

                if ( 'PUT' === method ) {
                    xhr.setRequestHeader( 'X-HTTP-Method-Override', method );
                } else if ( 'DELETE' === method ) {
                    xhr.setRequestHeader( 'X-HTTP-Method-Override', method );
                }
            },
            type: method,
            data: data
        });
    }
}

export default Dokan_API;
