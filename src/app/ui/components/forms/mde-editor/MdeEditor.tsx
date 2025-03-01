import React from "react";
import ReactMde from "react-mde";
import Showdown from "showdown";
import "./MdeEditor.css";

export default function MdeEditor({ currentNote, updateNote, className }: any) {
  const [selectedTab, setSelectedTab] = React.useState<any>("write");

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
  });

  return (
    <div className="mde-editor">
      <ReactMde
        value={currentNote}
        onChange={updateNote}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) =>
          Promise.resolve(converter.makeHtml(markdown))
        }
        maxEditorHeight={1000}
        minEditorHeight={680}
        heightUnits={"px"}
      />
    </div>
  );
}
