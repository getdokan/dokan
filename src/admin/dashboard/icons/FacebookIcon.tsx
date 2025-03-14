const FacebookIcon = (
    { className = '' } : { className?: string }
) => (
    <svg className={ `fill-neutral-400 ${ className }` } viewBox="0 0 10 17">
        <path d="M8.90377 0.714267L6.82893 0.710938C4.49791 0.710938 2.99151 2.25646 2.99151 4.64856V6.46407H0.90535C0.725081 6.46407 0.579102 6.61021 0.579102 6.79048V9.42094C0.579102 9.60121 0.725248 9.74719 0.90535 9.74719H2.99151V16.3847C2.99151 16.565 3.13749 16.7109 3.31776 16.7109H6.03961C6.21987 16.7109 6.36585 16.5648 6.36585 16.3847V9.74719H8.80506C8.98533 9.74719 9.13131 9.60121 9.13131 9.42094L9.13231 6.79048C9.13231 6.70393 9.09785 6.62103 9.03677 6.55978C8.97568 6.49852 8.89245 6.46407 8.80589 6.46407H6.36585V4.92504C6.36585 4.18532 6.54213 3.8098 7.50573 3.8098L8.90344 3.8093C9.08354 3.8093 9.22952 3.66315 9.22952 3.48305V1.04052C9.22952 0.860579 9.0837 0.714599 8.90377 0.714267Z" />
    </svg>
);

export default FacebookIcon;
