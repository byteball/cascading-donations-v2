import { FC } from "react";
import { Spin, Title } from "..";

export const ListOfDependenciesLoading: FC = async () => (
  <div>
    <div className='mt-24'>
      <Title level={2}>Support the dependencies</Title>
    </div>

    <div className="flex justify-center mt-10">
      <Spin size="large" />
    </div>
  </div>
)