<div class="wrap">
    <h1 style="margin-bottom: 20px;"><?php _e( 'Dokan Help', 'dokan-lite' ); ?> <a href="http://docs.wedevs.com/docs/dokan/" target="_blank" class="page-title-action"><?php _e( 'View all Documentations', 'dokan-lite' ); ?></a></h1>

    <?php
    $help_docs = get_transient( 'dokan_help_docs' );

    if ( false === $help_docs ) {
        $help_url  = 'https://api.bitbucket.org/2.0/snippets/wedevs/oErMz/files/dokan-help.json';
        $response  = wp_remote_get( $help_url, array('timeout' => 15) );
        $help_docs = wp_remote_retrieve_body( $response );

        if ( is_wp_error( $response ) || $response['response']['code'] != 200 ) {
            $help_docs = '[]';
        }

        set_transient( 'dokan_help_docs', $help_docs, 12 * HOUR_IN_SECONDS );
    }

    $help_docs    = json_decode( $help_docs );

    $headings = wp_list_pluck( $help_docs, 'title', 'icon' );
    ?>
    <div class="dokan-settings-wrap dokan-help-wrapper">
        <h2 class="nav-tab-wrapper">
            <?php foreach ( $headings as $icon => $heading ): ?>
                <?php
                    $heading_id = strtolower( str_replace( ' ', '_', $heading ) );
                ?>
                <a href="#<?php echo $heading_id; ?>" class="nav-tab" id="<?php echo $heading_id ?>-tab">
                    <span class="dashicons <?php echo $icon; ?>"></span>
                    <?php echo $heading; ?>
                </a>
            <?php endforeach ?>
        </h2>

        <div class="metabox-holder">
            <?php foreach ( $help_docs as $key => $help_doc ): ?>
                <?php $help_doc_id = strtolower( str_replace( ' ', '_', $help_doc->title ) ); ?>
                <div id="<?php echo $help_doc_id; ?>" class="group">
                    <?php
                        if ( file_exists( DOKAN_INC_DIR . '/admin/views/help/' . $help_doc_id . '.php' ) ) {
                            require_once DOKAN_INC_DIR . '/admin/views/help/' . $help_doc_id . '.php';
                        }
                    ?>

                    <h4><?php _e( 'Releated Links', 'dokan-lite' ); ?></h4>
                    <ul>
                        <?php foreach ( $help_doc->questions as $question ): ?>
                            <li><a href="<?php echo $question->link; ?>"><?php echo $question->title; ?></a></li>
                        <?php endforeach ?>
                    </ul>
                </div>
            <?php endforeach ?>
        </div>
    </div>

<style>
    .dokan-help-wrapper .dashicons {
        padding-top: 2px;
        margin-right: 4px;
    }
</style>

<script>
    jQuery(document).ready(function($) {
        // Switches option sections
        $('.group').hide();
        var activetab = '';
        if (typeof(localStorage) != 'undefined' ) {
            activetab = localStorage.getItem("activetab");
        }
        if (activetab != '' && $(activetab).length ) {
            $(activetab).fadeIn();
        } else {
            $('.group:first').fadeIn();
        }
        $('.group .collapsed').each(function(){
            $(this).find('input:checked').parent().parent().parent().nextAll().each(
            function(){
                if ($(this).hasClass('last')) {
                    $(this).removeClass('hidden');
                    return false;
                }
                $(this).filter('.hidden').removeClass('hidden');
            });
        });

        if (activetab != '' && $(activetab + '-tab').length ) {
            $(activetab + '-tab').addClass('nav-tab-active');
        }
        else {
            $('.nav-tab-wrapper a:first').addClass('nav-tab-active');
        }
        $('.nav-tab-wrapper a').click(function(evt) {
            $('.nav-tab-wrapper a').removeClass('nav-tab-active');
            $(this).addClass('nav-tab-active').blur();
            var clicked_group = $(this).attr('href');
            if (typeof(localStorage) != 'undefined' ) {
                localStorage.setItem("activetab", $(this).attr('href'));
            }
            $('.group').hide();
            $(clicked_group).fadeIn();
            evt.preventDefault();
        });
    });
</script>


