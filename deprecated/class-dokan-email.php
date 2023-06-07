<?php

/**
* Fallback for depricated
* Dokan Email Class
*/
class Dokan_Email {

    public static function init() {
        return dokan()->email;
    }
}
