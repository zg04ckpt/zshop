import React, { useState } from "react";
import { BaseProp } from "../../../shared";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

type CKEditorProp = BaseProp & {
    data: string;
    valueChange: (val:string) => void;
}

const CKeditor = (prop: CKEditorProp) => {

  return (
    <div>
      <CKEditor
        editor={ClassicEditor as any}
        data={prop.data}
        onChange={(event, editor) => {
          const data = editor.getData();
          prop.valueChange(data);
        }}
      />
      {/* <div>
        <h3>Output HTML:</h3>
        <div dangerouslySetInnerHTML={{ __html: prop.data }} />
      </div> */}
    </div>
  );
}

export default CKeditor;