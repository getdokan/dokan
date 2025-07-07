interface SectionProps {
    title: string;
    sectionHeader?: JSX.Element;
    children?: JSX.Element;
}
function Section( { title, sectionHeader, children }: SectionProps ) {
    return (
        <div className="mt-4">
            <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-md text-black">{ title }</h3>
                { sectionHeader && <div>{ sectionHeader }</div> }
            </div>
            <div>{ children }</div>
        </div>
    );
}

export default Section;
