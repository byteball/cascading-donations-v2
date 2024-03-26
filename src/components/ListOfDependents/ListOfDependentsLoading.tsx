import { FC } from "react";
import { Spin, Title } from "..";

export const ListOfDependentsLoading: FC = async () => (
  <div>
    <div className='mt-24'>
      <Title level={2}>Support the repos that depend on this repository</Title>
    </div>

    <div className="flex justify-center mt-10">
      <Spin size="large" />
    </div>
  </div>
)