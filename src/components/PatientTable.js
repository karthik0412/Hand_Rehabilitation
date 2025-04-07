import React from "react";
import { useTable } from "react-table";

const PatientTable = ({ patientID }) => {
    const data = [
        { date: "01-Jul-2024", flex: 45, force: 10 },
        { date: "02-Jul-2024", flex: 50, force: 12 },
        { date: "03-Jul-2024", flex: 55, force: 15 }
    ];

    const columns = [
        { Header: "Date", accessor: "date" },
        { Header: "Flex Sensor (°)", accessor: "flex" },
        { Header: "Force Sensor (N)", accessor: "force" }
    ];

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });

    return (
        <table {...getTableProps()} style={{ border: "1px solid black", margin: "20px auto", width: "80%" }}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()}>{column.render("Header")}</th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => (
                                <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                            ))}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default PatientTable;
