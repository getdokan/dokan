import {
    DokanFieldLabel,
    SocialButton,
} from '../../../../../../components/fields';

const DokanSocialField = ( { element } ) => {
    return (
        <div className="flex justify-between gap-2 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
            />
            <SocialButton
                network={ element.network }
                label={ element.title }
                disabled={ element.disabled }
            />
        </div>
    );
};

export default DokanSocialField;
