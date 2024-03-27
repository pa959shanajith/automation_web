import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const GenerateTestCaseList = ({ apiResponse, setSelectedGenAiTc, setTextAreaData, readOnly, setReadOnly, readOnlyData, setReadOnlyData}) => {
    const [selectedElement, setSelectedElement] = useState([]);
    console.log("selectedElement",selectedElement)
    console.log(apiResponse,' apiResponse from API`');
    useEffect(() => {
        setTextAreaData("");
        setReadOnly(false);
        setSelectedElement([]);
    },[apiResponse])
    const onRowClick = (e) => {
        console.log("rowclick",e)
        if(e?.type == "all"){
            setReadOnly(true);
            setReadOnlyData(e?.value)
        }else{
            // for single test case selection
            if(e?.value?.length == 1){
                const selectedTestCase = e?.value;
                setReadOnly(false);
                setTextAreaData(selectedTestCase[0]["TestCase"]);
            }else if(e?.value?.length == 0) {
                setTextAreaData("");
                setReadOnly(false);
            }
            // for multiple test case selection
            else if(e?.value?.length > 1){
                setReadOnly(true);
                setReadOnlyData(e?.value)
            }
        }
        setSelectedGenAiTc(e?.value);
        setSelectedElement(e?.value);

    };
    const renderTableRowData = (rowData)=>{
            return <div className='flex flex-row justify-content-between align-items-center'>
            {/* <div className='w-1 mr-2'>
                <img src='static/imgs/genai_tc_icon.svg' className='w-100'/>
            </div> */}
            <div className=''>{rowData?.Name}</div>
        </div>
       
    }
    return <div className="w-6 pr-2">
        <div className='generateTests_header'>Generated Tests</div>
        <DataTable
            className='generateTests_dataTable'
            headerCheckboxToggleAllDisabled={false}
            selection={selectedElement}
            onSelectionChange={onRowClick}
            value={apiResponse}
            emptyMessage=""
            selectionMode={"single"}>
            <Column selectionMode="multiple"/>
            <Column field="Name" header="All test cases" body={renderTableRowData}/>
        </DataTable>
    </div>
}

export default GenerateTestCaseList;