"use client";

import { PieConfig } from "@ant-design/charts";

import { getAvatarUrl, truncate } from ".";

export interface IParsedRule {
  repo: string;
  percent: number;
}

const colors = ["#6295F9", "#F6C02D", "#a0d911", "#1890ff", "#2f54eb", "#722ed1", "#003a8c", "#8c8c8c", "#135200"];


export const getRecipientsChartConfig = (fullName: string, width: number): PieConfig => {
  let actual = 0;

  return ({
    data: [],
    appendPadding: width >= 830 ? 10 : 0,
    angleField: 'percent',
    colorField: 'repo',
    animation: false,
    pieStyle: (type: IParsedRule) => {
      if (type.repo !== fullName) {
        return ({
          cursor: "pointer",
          stroke: "#ddd",
          lineWidth: 1,
        })
      } else {
        return ({
          stroke: "#ddd",
          lineWidth: 1,
        })
      }
    },
    color: (type: any) => {
      if (type.repo === fullName) {
        return "#ddd"
      } else {
        const color = colors[actual];
        actual++;
        return color;
      }
    },
    radius: width >= 830 ? 0.8 : 1,
    renderer: "svg",
    label: {
      type: width >= 830 ? 'spider' : 'inner',
      content: width >= 830 ? `{name}
      {percentage}` : (item: any) => item.percent > 0.07 ? `${truncate(item.repo, 15)} 
      ${item.repo ? (item.percent * 100).toFixed(0) + "%" : ""}` : "",
      style: {
        fontSize: width >= 600 ? 12 : 10,
        textAlign: "center",
        fill: "#2D2C2C",
        background: "red",
      },
      autoRotate: false,
      labelHeight: 40
    },

    tooltip: {
      customContent: (_: any, items: any) => {
        return (
          <div key="tooltip">
            <ul style={{ paddingLeft: 0, fontSize: 14 }}>
              {items?.map((item: any, index: any) => {
                const { name, value } = item;
                const avatarUrl = getAvatarUrl(name.split("/")?.[0])
                return (
                  <li
                    key={`tooltip-${item.name}-${index}`}
                    className="g2-tooltip-list-item"
                    data-index={index}
                    style={{ padding: 3 }}
                  >
                    <span
                      style={{ lineHeight: 1.3 }}
                    >
                      <img src={avatarUrl} style={{ width: "1em", height: "1em", borderRadius: 5, marginRight: 5, marginBottom: 3 }} alt={name} />
                      <span style={{ marginRight: 4 }}>{name}</span>
                      <span>receives {value}% of donations</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        );
      },
    },
    style: {
      userSelect: "none",
      stroke: "#000",
      width: width >= 830 ? 800 : width - 78,
      height: width > 600 ? "auto" : 300
    }
  })
}