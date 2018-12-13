<?php

/**
 * Category walker for generating dokan category
 */
class Dokan_Category_Walker extends Walker {

    var $tree_type = 'category';
    var $db_fields = array('parent' => 'parent', 'id' => 'term_id'); //TODO: decouple this

    function start_lvl( &$output, $depth = 0, $args = array() ) {
        $indent = str_repeat( "\t", $depth );

        if ( $depth == 0 ) {
            $output .= $indent . '<ul class="children level-' . $depth . '">' . "\n";
        } else {
            $output .= "$indent<ul class='children level-$depth'>\n";
        }
    }

    function end_lvl( &$output, $depth = 0, $args = array() ) {
        $indent = str_repeat( "\t", $depth );

        if ( $depth == 0 ) {
            $output .= "$indent</ul> <!-- .sub-category -->\n";
        } else {
            $output .= "$indent</ul>\n";
        }
    }

    function start_el( &$output, $category, $depth = 0, $args = array(), $id = 0 ) {
        extract( $args );
        $indent = str_repeat( "\t\r", $depth );

        if ( $depth == 0 ) {
            $caret = $args['has_children'] ? ' <span class="caret-icon"><i class="fa fa-angle-right" aria-hidden="true"></i></span>' : '';
            $class_name = $args['has_children'] ? ' class="has-children parent-cat-wrap"' : ' class="parent-cat-wrap"';
            $output .= $indent . '<li' . $class_name . '><a href="'. get_term_link( $category ) .'">' . $category->name . $caret . '</a>' . "\n";
        } else {
            $caret = $args['has_children'] ? ' <span class="caret-icon"><i class="fa fa-angle-right" aria-hidden="true"></i></span>' : '';
            $class_name = $args['has_children'] ? ' class="has-children"' : '';
            $output .= $indent . '<li' . $class_name . '><a href="' . get_term_link( $category ) . '">' . $category->name . $caret . '</a>';
        }
    }

    function end_el( &$output, $category, $depth = 0, $args = array() ) {
        $indent = str_repeat( "\t", $depth );

        if ( $depth == 1 ) {
            $output .= "$indent</li><!-- .sub-block -->\n";
        } else {
            $output .= "$indent</li>\n";
        }
    }
}

if ( ! class_exists( 'Dokan_Category_Widget' ) ) :

/**
 * new WordPress Widget format
 * Wordpress 2.8 and above
 * @see http://codex.wordpress.org/Widgets_API#Developing_Widgets
 */
class Dokan_Category_Widget extends WP_Widget {

    /**
     * Constructor
     *
     * @return void
     **/
    public function __construct() {
        $widget_ops = array( 'classname' => 'dokan-category-menu', 'description' => __( 'Dokan product category menu', 'dokan-lite' ) );
        parent::__construct( 'dokan-category-menu', 'Dokan: Product Category', $widget_ops );
    }

    /**
     * Outputs the HTML for this widget.
     *
     * @param array  An array of standard parameters for widgets in this theme
     * @param array  An array of settings for this widget instance
     * @return void Echoes it's output
     **/
    function widget( $args, $instance ) {
        extract( $args, EXTR_SKIP );

        $title = apply_filters( 'widget_title', $instance['title'] );

        echo $before_widget; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped

        if ( ! empty( $title ) )
            echo $args['before_title'] . $title . $args['after_title']; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped

        ?>
            <div id="cat-drop-stack">
                <?php
                $args = apply_filters( 'dokan_category_widget', array(
                    'hide_empty' => false,
                    'orderby' => 'name',
                    'depth' => 3
                ) );

                $categories = get_terms( 'product_cat', $args );

                $args = array(
                    'taxonomy' => 'product_cat',
                    'selected_cats' => ''
                );

                $walker = new Dokan_Category_Walker();
                echo "<ul>";
                echo call_user_func_array( array(&$walker, 'walk'), array( $categories, 0, array()) ); // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
                echo "</ul>";
                ?>
            </div>
            <script>
            ( function ( $ ) {

                $( '#cat-drop-stack li.has-children' ).on( 'click', '> a span.caret-icon', function ( e ) {
                    e.preventDefault();
                    var self = $( this ),
                        liHasChildren = self.closest( 'li.has-children' );

                    if ( !liHasChildren.find( '> ul.children' ).is( ':visible' ) ) {
                        self.find( 'i.fa' ).addClass( 'fa-rotate-90' );
                        if ( liHasChildren.find( '> ul.children' ).hasClass( 'level-0' ) ) {
                            self.closest( 'a' ).css( { 'borderBottom': 'none' } );
                        }
                    }

                    liHasChildren.find( '> ul.children' ).slideToggle( 'fast', function () {
                        if ( !$( this ).is( ':visible' ) ) {
                            self.find( 'i.fa' ).removeClass( 'fa-rotate-90' );

                            if ( liHasChildren.find( '> ul.children' ).hasClass( 'level-0' ) ) {
                                self.closest( 'a' ).css( { 'borderBottom': '1px solid #eee' } );
                            }
                        }
                    } );
                } );
            } )( jQuery );
        </script>
        <?php

        echo $after_widget; // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
    }

    /**
     * Deals with the settings when they are saved by the admin. Here is
     * where any validation should be dealt with.
     *
     * @param array  An array of new settings as submitted by the admin
     * @param array  An array of the previous settings
     * @return array The validated and (if necessary) amended settings
     **/
    function update( $new_instance, $old_instance ) {

        // update logic goes here
        $updated_instance = $new_instance;
        return $updated_instance;
    }

    /**
     * Displays the form for this widget on the Widgets page of the WP Admin area.
     *
     * @param array  An array of the current settings for this widget
     * @return void Echoes it's output
     **/
    function form( $instance ) {
        $instance = wp_parse_args( (array) $instance, array(
            'title' => __( 'Product Category', 'dokan-lite' )
        ) );

        $title = $instance['title'];
        ?>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title:', 'dokan-lite' ); ?></label>
            <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>" />
        </p>
        <?php
    }
}

endif;
