<?php

/**
* Fallback for deprecated
* Dokan Email Class
 *
 * @deprecated 3.0.0 use dokan()->email instead of Dokan_Email
*/
class Dokan_Email {

    public static function init() {
        return dokan()->email;
    }
}
