import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {
  Archive,
  Award,
  Building2,
  GraduationCap,
  Settings2,
  UsersRound,
} from 'lucide-react';
import CategoryCard from '@site/src/components/Home/CategoryCard';
import HeroSearch from '@site/src/components/Home/HeroSearch';

const chineseHomeContent = {
  badge: '链工宝帮助中心',
  title: '有什么可以帮你？',
  description: '面向管理员与业务人员的产品帮助中心，快速定位账号、组织、培训、学习和合规档案相关操作。',
  searchPlaceholder: '请输入关键词，如：创建账号、重置密码、菜单权限',
  searchAriaLabel: '搜索链工宝帮助文档',
  clearSearchLabel: '清空搜索关键词',
  searchHistoryTitle: '搜索历史',
  removeHistoryLabel: '删除搜索历史：',
  searchHistoryEmpty: '暂无搜索历史',
  noResultsTitle: '没有找到相关文档',
  noResultsDescription: '试试搜索：账号、角色、密码、权限',
  pageTitle: '链工宝帮助中心',
  pageDescription: '链工宝账号设置、组织管理、培训任务、学习中心、积分规则、档案与合规帮助中心',
  sectionTitle: '使用链工宝',
  sectionDescription: '选择你要处理的业务场景，快速进入对应帮助文档。',
  cards: [
    {
      title: '账号设置',
      description: '登录平台、创建账号、账号管理与角色权限配置。',
      to: '/docs/category/账号设置',
      icon: Settings2,
    },
    {
      title: '组织管理',
      description: '维护部门、岗位与员工信息，搭建清晰组织架构。',
      to: '/docs/category/组织管理',
      icon: Building2,
    },
    {
      title: '培训任务',
      description: '创建培训计划、导入学员并持续追踪学习进度。',
      to: '/docs/category/培训任务',
      icon: UsersRound,
    },
    {
      title: '学习中心',
      description: '管理课程、题库、考试、讲师与教室资源。',
      to: '/docs/category/学习中心',
      icon: GraduationCap,
    },
    {
      title: '积分规则',
      description: '配置学习积分规则，激励员工完成安全培训。',
      to: '/docs/category/积分规则',
      icon: Award,
    },
    {
      title: '档案与合规',
      description: '查看一人一档、学时证明与任务合格证明。',
      to: '/docs/category/档案与合规',
      icon: Archive,
    },
  ],
};

const englishHomeContent = {
  badge: 'Liangongbao Help Center',
  title: 'How can we help you?',
  description: 'A practical help center for admins and operators to find account, organization, training, learning, and compliance workflows.',
  searchPlaceholder: 'Search keywords, such as account creation, password reset, or menu permissions',
  searchAriaLabel: 'Search Liangongbao help docs',
  clearSearchLabel: 'Clear search keywords',
  searchHistoryTitle: 'Search history',
  removeHistoryLabel: 'Remove search history: ',
  searchHistoryEmpty: 'No search history yet',
  noResultsTitle: 'No related docs found',
  noResultsDescription: 'Try searching: account, role, password, permission',
  pageTitle: 'Liangongbao Help Center',
  pageDescription: 'Liangongbao help center for account settings, organization management, training tasks, learning center, point rules, archives, and compliance.',
  sectionTitle: 'Use Liangongbao',
  sectionDescription: 'Choose the business scenario you want to handle and quickly open the related help docs.',
  cards: [
    {
      title: 'Account Settings',
      description: 'Log in to the platform, create accounts, manage accounts, and configure role permissions.',
      to: '/docs/category/账号设置',
      icon: Settings2,
    },
    {
      title: 'Organization Management',
      description: 'Maintain departments, positions, and employee information to build a clear organization structure.',
      to: '/docs/category/组织管理',
      icon: Building2,
    },
    {
      title: 'Training Tasks',
      description: 'Create training plans, import learners, and continuously track learning progress.',
      to: '/docs/category/培训任务',
      icon: UsersRound,
    },
    {
      title: 'Learning Center',
      description: 'Manage courses, question banks, exams, instructors, and classroom resources.',
      to: '/docs/category/学习中心',
      icon: GraduationCap,
    },
    {
      title: 'Point Rules',
      description: 'Configure learning point rules to motivate employees to complete safety training.',
      to: '/docs/category/积分规则',
      icon: Award,
    },
    {
      title: 'Archives And Compliance',
      description: 'View employee archives, class-hour certificates, and task completion certificates.',
      to: '/docs/category/档案与合规',
      icon: Archive,
    },
  ],
};

export default function Home() {
  const {
    i18n: {currentLocale},
  } = useDocusaurusContext();
  const content = currentLocale === 'en' ? englishHomeContent : chineseHomeContent;

  return (
    <Layout title={content.pageTitle} description={content.pageDescription}>
      <div className="bg-white text-slate-950">
        <HeroSearch content={content} showSearch={currentLocale !== 'en'} />
        <main className="bg-white">
          <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Heading as="h2" className="m-0 text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">
                  {content.sectionTitle}
                </Heading>
                <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{content.sectionDescription}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.cards.map((card) => (
                <CategoryCard key={card.title} {...card} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
