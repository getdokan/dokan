/**
 * External dependencies
 */
import { Component } from "@wordpress/element";
import { xor } from "lodash";

/**
 * Internal dependencies
 */
import SectionControls from "./section-controls";
import Leaderboard from "../analytics/components/leaderboard";

export default class Section extends Component {
  constructor(props) {
    super(props);
    const { title } = props;

    this.state = {
      titleInput: title,
    };

    this.onToggleHiddenBlock = this.onToggleHiddenBlock.bind(this);
    this.onTitleChange = this.onTitleChange.bind(this);
    this.onTitleBlur = this.onTitleBlur.bind(this);
  }

  onTitleChange(updatedTitle) {
    this.setState({ titleInput: updatedTitle });
  }

  onTitleBlur() {
    const { onTitleUpdate, title } = this.props;
    const { titleInput } = this.state;

    if (titleInput === "") {
      this.setState({ titleInput: title });
    } else if (onTitleUpdate) {
      onTitleUpdate(titleInput);
    }
  }

  onToggleHiddenBlock(key) {
    return () => {
      const hiddenBlocks = xor(this.props.hiddenBlocks, [key]);
      this.props.onChangeHiddenBlocks(hiddenBlocks);
    };
  }

  render() {
    const { component: SectionComponent, ...props } = this.props;
    const { titleInput } = this.state;
    console.log("dfasfd props", props);

    return (
      <div className="woocommerce-dashboard-section">
        {/* <Leaderboard
          id={"products"}
          onTitleChange={this.onTitleChange}
          onTitleBlur={this.onTitleBlur}
          onToggleHiddenBlock={this.onToggleHiddenBlock}
          titleInput={titleInput}
          controls={SectionControls}
          totalRows={5}
          headers={[
            { label: "Name" },
            { label: "Items sold" },
            { label: "Net sales" },
          ]}
          {...props}
        />

        {/* <Leaderboard
          id={"categories"}
          onTitleChange={this.onTitleChange}
          onTitleBlur={this.onTitleBlur}
          onToggleHiddenBlock={this.onToggleHiddenBlock}
          titleInput={titleInput}
          controls={SectionControls}
          totalRows={5}
          headers={[
            { label: "Name" },
            { label: "Items sold" },
            { label: "Net sales" },
          ]}
          {...props}
        /> */}

        <SectionComponent
          onTitleChange={this.onTitleChange}
          onTitleBlur={this.onTitleBlur}
          onToggleHiddenBlock={this.onToggleHiddenBlock}
          titleInput={titleInput}
          controls={SectionControls}
          {...props}
        />
      </div>
    );
  }
}
