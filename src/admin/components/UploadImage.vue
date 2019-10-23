<template>
    <div class="dokan-upload-image" @click="uploadImage">
        <img v-if="! showButton" :src="image.src ? image.src : src" :style="">

        <button v-if="showButton" @click.prevent="uploadImage">
            {{ buttonLabel }}
        </button>
    </div>
</template>

<script>
export default {
    name: 'UploadImage',

    inheritAttrs: false,

    props: {
        src: {
            default: dokan.urls.assetsUrl + '/images/store-pic.png',
        },
        showButton: {
            type: Boolean,
            default: false,
        },
        buttonLabel: {
            type: String,
            default: 'Upload Image'
        },
        croppingWidth: {
            type: Number
        },
        croppingHeight: {
            type: Number
        }
    },

    data() {
        return {
            image: {
                src: '',
                id: '',
            }
        }
    },

    methods: {
        uploadImage() {
            this.openMediaManager( this.onSelectImage );
        },

        onSelectImage( image ) {
            this.image.src = image.url;
            this.image.id = image.id;
            this.$emit( 'uploadedImage', this.image );
        },

        /**
         * Open Image Media Uploader
         *
         * @param  function callback
         *
         * @return callback
         */
        openMediaManager( callback ) {
            const self = this;

            if (self.fileFrame) {
                self.fileFrame.open();
                return;
            }

            const fileStatesOptions = {
                library: wp.media.query(),
                multiple: false, // set it true for multiple image
                title: this.__('Select & Crop Image', 'dokan-lite'),
                priority: 20,
                filterable: 'uploaded',
                autoSelect: true,
                suggestedWidth: 500,
                suggestedHeight: 300
            };

           const cropControl = {
               id: "control-id",
               params: {
                    width: this.croppingWidth ? parseInt( this.croppingWidth, 10 ) : parseInt( dokan.store_banner_dimension.width, 10 ),
                    height: this.croppingHeight ? parseInt( this.croppingHeight, 10 ) : parseInt( dokan.store_banner_dimension.height, 10 ),
                    flex_width: !! parseInt( dokan.store_banner_dimension['flex-width'], 10 ),
                    flex_height: !! parseInt( dokan.store_banner_dimension['flex-height'], 10 ),
               }
           };

           cropControl.mustBeCropped = function(flexW, flexH, dstW, dstH, imgW, imgH) {

            // If the width and height are both flexible
            // then the user does not need to crop the image.
            if ( true === flexW && true === flexH ) {
                return false;
            }

            // If the width is flexible and the cropped image height matches the current image height,
            // then the user does not need to crop the image.
            if ( true === flexW && dstH === imgH ) {
                return false;
            }

            // If the height is flexible and the cropped image width matches the current image width,
            // then the user does not need to crop the image.
            if ( true === flexH && dstW === imgW ) {
                return false;
            }

            // If the cropped image width matches the current image width,
            // and the cropped image height matches the current image height
            // then the user does not need to crop the image.
            if ( dstW === imgW && dstH === imgH ) {
                return false;
            }

            // If the destination width is equal to or greater than the cropped image width
            // then the user does not need to crop the image...
            if ( imgW <= dstW ) {
                return false;
            }

            return true;

           };

            const fileStates = [
                new wp.media.controller.Library(fileStatesOptions),
                new wp.media.controller.CustomizeImageCropper({
                    imgSelectOptions: self.calculateImageSelectOptions,
                    control: cropControl
                })
            ];

            const mediaOptions = {
                title: this.__('Select Image', 'dokan-lite'),
                button: {
                    text: this.__('Select Image', 'dokan-lite'),
                    close: false
                },
                multiple: false
            };

            mediaOptions.states = fileStates;

            self.fileFrame = wp.media(mediaOptions);

            self.fileFrame.on('select', () => {
                self.fileFrame.setState( 'cropper' );
            });

            self.fileFrame.on('cropped', (croppedImage) => {
                callback(croppedImage);
                self.fileFrame = null;
            });

            self.fileFrame.on('skippedcrop', () => {
                const selection = self.fileFrame.state().get('selection');

                const files = selection.map((attachment) => {
                    return attachment.toJSON();
                });

                const file = files.pop();

                callback(file);

                self.fileFrame = null;
            });

            self.fileFrame.on('close', () => {
                self.fileFrame = null;
            });

            self.fileFrame.on('ready', () => {
                self.fileFrame.uploader.options.uploader.params = {
                    type: 'dokan-vendor-option-media'
                };
            });

            self.fileFrame.open();
        },

        /**
         * Calculate image section options
         *
         * @param  object attachment
         * @param  object controller
         *
         * @return object
         */
        calculateImageSelectOptions: function(attachment, controller) {
            let xInit      = this.croppingWidth ? parseInt( this.croppingWidth, 10 ) : parseInt( dokan.store_banner_dimension.width, 10 );
            let yInit      = this.croppingHeight ? parseInt( this.croppingHeight, 10 ) : parseInt( dokan.store_banner_dimension.height, 10 );
            let flexWidth  = !! parseInt( dokan.store_banner_dimension['flex-width'], 10 );
            let flexHeight = !! parseInt( dokan.store_banner_dimension['flex-height'], 10 );

            let ratio, xImg, yImg, realHeight, realWidth, imgSelectOptions;

            realWidth = attachment.get('width');
            realHeight = attachment.get('height');

            let control = controller.get('control');

            controller.set( 'canSkipCrop', ! control.mustBeCropped( flexWidth, flexHeight, xInit, yInit, realWidth, realHeight ) );

            ratio = xInit / yInit;
            xImg = realWidth;
            yImg = realHeight;

            if ( xImg / yImg > ratio ) {
                yInit = yImg;
                xInit = yInit * ratio;
            } else {
                xInit = xImg;
                yInit = xInit / ratio;
            }

            imgSelectOptions = {
                handles: true,
                keys: true,
                instance: true,
                persistent: true,
                imageWidth: realWidth,
                imageHeight: realHeight,
                x1: 0,
                y1: 0,
                x2: xInit,
                y2: yInit
            };

            if (flexHeight === false && flexWidth === false) {
                imgSelectOptions.aspectRatio = xInit + ':' + yInit;
            }
            if (flexHeight === false ) {
                imgSelectOptions.maxHeight = yInit;
            }
            if (flexWidth === false ) {
                imgSelectOptions.maxWidth = xInit;
            }

            return imgSelectOptions;
        },
    }
};
</script>
<style lang="less">
    .dokan-upload-image {
        width: 100%;

        img {
            cursor: pointer;
        }
    }
</style>